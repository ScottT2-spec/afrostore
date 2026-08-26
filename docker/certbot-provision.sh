#!/bin/sh
# Runs inside the certbot container. Replaces the old plain "certbot renew"
# loop with one that also provisions brand-new domains, not just renews
# existing ones — this is the piece that was completely missing before:
# a verified domain in the database never actually got an nginx route or
# an SSL certificate without this.
#
# Loop, every 5 minutes:
#   1. For each *.conf file in the shared nginx/domains volume that does
#      NOT yet have a cert under /etc/letsencrypt/live/<domain>/, run
#      certbot certonly via the HTTP-01 webroot challenge (this only
#      works because the app already wrote the HTTP-only config, which
#      nginx's self-reload loop — see docker-compose.yml's nginx command —
#      picks up and serves, including the /.well-known/acme-challenge/
#      path certbot needs).
#   2. On success, overwrite that domain's config with the full SSL
#      server block instead of the HTTP-only one.
#   3. Separately, run the normal "certbot renew" for domains that
#      already have a cert, same as before.

DOMAINS_DIR="${NGINX_DOMAINS_DIR:-/etc/nginx/conf.d/domains}"
UPSTREAM_PORT=3000
CERT_EMAIL="${CERTBOT_EMAIL:-admin@prokip.africa}"

provision_new_domains() {
  for conf in "$DOMAINS_DIR"/*.conf; do
    [ -e "$conf" ] || continue
    domain=$(basename "$conf" .conf)
    [ -d "/etc/letsencrypt/live/$domain" ] && continue

    echo "[provision] Issuing certificate for $domain..."
    if certbot certonly --webroot -w /var/www/certbot \
        -d "$domain" -d "www.$domain" \
        --non-interactive --agree-tos -m "$CERT_EMAIL" \
        --cert-name "$domain"; then
      echo "[provision] Certificate issued for $domain — upgrading its nginx config to SSL."
      cat > "$conf" <<EOF
# Auto-generated — SSL provisioned $(date -u +%Y-%m-%dT%H:%M:%SZ)
server {
    listen 80;
    listen [::]:80;
    server_name $domain www.$domain;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 301 https://\$host\$request_uri; }
}
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $domain www.$domain;
    ssl_certificate /etc/letsencrypt/live/$domain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$domain/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    location / {
        proxy_pass http://app:$UPSTREAM_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
    }
}
EOF
    else
      echo "[provision] Certificate issuance FAILED for $domain — will retry next cycle. Check DNS is actually pointed at this server yet."
    fi
  done
}

while :; do
  provision_new_domains
  certbot renew --webroot -w /var/www/certbot --non-interactive
  sleep 300
done
