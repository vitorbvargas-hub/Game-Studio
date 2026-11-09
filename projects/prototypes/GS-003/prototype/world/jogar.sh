#!/usr/bin/env bash
# Liga o jogo GS-003 no navegador: http://localhost:5174/?map=digimon-forest-01
# Uso: bash ~/projects/GameStudio/projects/prototypes/GS-003/prototype/world/jogar.sh
# Deixe o terminal aberto enquanto joga; Ctrl+C desliga.
cd "$(dirname "$0")"
# Teste rápido da evolução (XP ×25, a poucas vitórias de digievoluir, save separado): o 2º link.
if curl -s -o /dev/null --max-time 2 http://127.0.0.1:5174/; then
  echo "O jogo já está ligado: http://localhost:5174/?map=digimon-forest-01"
  echo "Ver o Digimon ganhar XP e digievoluir (modo teste, save separado): http://localhost:5174/?map=digimon-forest-01&demo=evo"
  exit 0
fi
echo "Abra no navegador: http://localhost:5174/?map=digimon-forest-01"
echo "Ver o Digimon ganhar XP e digievoluir (modo teste, save separado): http://localhost:5174/?map=digimon-forest-01&demo=evo"
exec npm run dev
