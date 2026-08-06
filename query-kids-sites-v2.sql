SELECT s.id, s.name, s.slug, st.templateId, t.slug as template_slug, t.name as template_name
FROM sites s
JOIN site_templates st ON s.id = st.siteId
JOIN templates t ON st.templateId = t.id
WHERE t.slug = 'kids' OR t.slug LIKE '%kids%';
