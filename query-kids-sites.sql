SELECT id, name, slug, template 
FROM Site 
WHERE template = 'kids' OR template LIKE '%kids%';
