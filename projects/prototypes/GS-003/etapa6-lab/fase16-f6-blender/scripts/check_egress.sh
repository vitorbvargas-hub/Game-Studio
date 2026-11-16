#!/usr/bin/env bash
# F6: confere se os hosts de download do Blender passam pelo proxy de saída do OpenClaw.
# Usa só as variáveis de ambiente já existentes; não imprime credenciais e não tenta contornar o proxy.
for h in download.blender.org www.blender.org mirror.clarkson.edu ftp.nluug.nl archive.ubuntu.com pypi.org files.pythonhosted.org release-assets.githubusercontent.com github.com; do
  code=$(curl -s -m 20 -o /dev/null -w '%{http_code} connect=%{http_connect}' "https://$h/")
  echo "$h -> $code"
done
