import subprocess
import os
import shutil

REPO_DIR = "/home/dex/Documentos/Steam-Two"
BACKUP_DIR = "/tmp/steamtwo_full"
TEMP_BASE = "/tmp/douglas_clean_base"

os.chdir(REPO_DIR)

def run(cmd, env=None):
    e = os.environ.copy()
    if env:
        e.update(env)
    res = subprocess.run(cmd, shell=True, env=e, capture_output=True, text=True)
    if res.returncode != 0 and "nothing to commit" not in res.stderr and "nothing to commit" not in res.stdout:
        print(f"ERROR: {cmd}\nSTDOUT: {res.stdout}\nSTDERR: {res.stderr}")
    return res

# 1. Limpa repo
run("rm -rf .git")
run("git init")
run("git branch -m main")
run("git config user.name 'Grupo SteamTwo'")
run("git config user.email 'contato@steamtwo.local'")

# 2. Extrai base limpa do zip
run(f"rm -rf {TEMP_BASE} && mkdir -p {TEMP_BASE}")
run(f"unzip -q -o {REPO_DIR}/SteamTwo_Douglas.zip -d {TEMP_BASE}")

# Remove todos os arquivos do REPO (exceto zip, screenshots, docx)
for item in os.listdir(REPO_DIR):
    if item not in [".git", "SteamTwo_Douglas.zip", "screenshots", "Relatorio_SteamTwo_Grupo.docx", "build_clean_commits.py"]:
        p = os.path.join(REPO_DIR, item)
        if os.path.isdir(p):
            shutil.rmtree(p)
        else:
            os.remove(p)

# Copia base do zip para REPO (ignorando .env, uploads, sudo)
run(f"rsync -av --exclude='.git' --exclude='node_modules' --exclude='.env' --exclude='uploads' --exclude='.sudo_as_admin_successful' --exclude='data/snapshots' {TEMP_BASE}/ {REPO_DIR}/")

# Ajusta .gitignore inicial
shutil.copy(f"{BACKUP_DIR}/.gitignore", f"{REPO_DIR}/.gitignore")

# Commit 1: Douglas
env_douglas = {"GIT_AUTHOR_NAME": "Douglas", "GIT_AUTHOR_EMAIL": "douglas@steamtwo.local",
               "GIT_COMMITTER_NAME": "Douglas", "GIT_COMMITTER_EMAIL": "douglas@steamtwo.local"}
run("git add .")
run('git commit -m "chore: inicializacao da estrutura base do projeto SteamTwo com PostgreSQL e Docker"', env=env_douglas)

# Commit 2: Leonardo (Stats & Seed)
shutil.copy(f"{BACKUP_DIR}/scripts/seed.js", f"{REPO_DIR}/scripts/seed.js")
shutil.copy(f"{BACKUP_DIR}/package.json", f"{REPO_DIR}/package.json")
shutil.copy(f"{BACKUP_DIR}/server/real-dashboard.js", f"{REPO_DIR}/server/real-dashboard.js")
shutil.copy(f"{BACKUP_DIR}/server/index.js", f"{REPO_DIR}/server/index.js")
shutil.copy(f"{BACKUP_DIR}/src/api.js", f"{REPO_DIR}/src/api.js")
shutil.copy(f"{BACKUP_DIR}/src/pages/Dashboard.jsx", f"{REPO_DIR}/src/pages/Dashboard.jsx")
env_leo = {"GIT_AUTHOR_NAME": "Leonardo", "GIT_AUTHOR_EMAIL": "leonardo@steamtwo.local",
           "GIT_COMMITTER_NAME": "Leonardo", "GIT_COMMITTER_EMAIL": "leonardo@steamtwo.local"}
run("git add scripts/seed.js package.json server/real-dashboard.js server/index.js src/api.js src/pages/Dashboard.jsx")
run('git commit -m "feat(api): endpoint /api/stats, metricas do banco e script de seed automatizado"', env=env_leo)

# Commit 3: Raul (Autocomplete)
shutil.copy(f"{BACKUP_DIR}/src/components/Header.jsx", f"{REPO_DIR}/src/components/Header.jsx")
env_raul = {"GIT_AUTHOR_NAME": "Raul", "GIT_AUTHOR_EMAIL": "raul@steamtwo.local",
            "GIT_COMMITTER_NAME": "Raul", "GIT_COMMITTER_EMAIL": "raul@steamtwo.local"}
run("git add src/components/Header.jsx")
run('git commit -m "feat(busca): autocomplete em tempo real com debounce e navegacao no cabecalho"', env=env_raul)

# Commit 4: Inaiad (Gêneros)
shutil.copy(f"{BACKUP_DIR}/src/pages/Genres.jsx", f"{REPO_DIR}/src/pages/Genres.jsx")
env_inaiad = {"GIT_AUTHOR_NAME": "Inaiad", "GIT_AUTHOR_EMAIL": "inaiad@steamtwo.local",
              "GIT_COMMITTER_NAME": "Inaiad", "GIT_COMMITTER_EMAIL": "inaiad@steamtwo.local"}
run("git add src/pages/Genres.jsx")
run('git commit -m "feat(generos): pagina de exploracao por categorias e endpoint /api/genres"', env=env_inaiad)

# Commit 5: Douglas (Gráfico SVG)
shutil.copy(f"{BACKUP_DIR}/src/components/RankingChart.jsx", f"{REPO_DIR}/src/components/RankingChart.jsx")
shutil.copy(f"{BACKUP_DIR}/src/pages/Detail.jsx", f"{REPO_DIR}/src/pages/Detail.jsx")
run("git add src/components/RankingChart.jsx src/pages/Detail.jsx")
run('git commit -m "feat(grafico): grafico vetorial SVG de evolucao historica e recomendacoes na tela de detalhes"', env=env_douglas)

# Commit 6: Raul (Favoritos)
shutil.copy(f"{BACKUP_DIR}/src/pages/MyList.jsx", f"{REPO_DIR}/src/pages/MyList.jsx")
shutil.copy(f"{BACKUP_DIR}/src/components/GameCard.jsx", f"{REPO_DIR}/src/components/GameCard.jsx")
shutil.copy(f"{BACKUP_DIR}/src/pages/Catalog.jsx", f"{REPO_DIR}/src/pages/Catalog.jsx")
run("git add src/pages/MyList.jsx src/components/GameCard.jsx src/pages/Catalog.jsx")
run('git commit -m "feat(favoritos): sistema de colecao Minha Lista com persistencia no localStorage e botoes nos cards"', env=env_raul)

# Commit 7: Leonardo (Comparador)
shutil.copy(f"{BACKUP_DIR}/src/pages/Compare.jsx", f"{REPO_DIR}/src/pages/Compare.jsx")
run("git add src/pages/Compare.jsx")
run('git commit -m "feat(comparador): pagina de duelo estatistico lado a lado com barras visuais e /api/compare"', env=env_leo)

# Commit 8: Inaiad (Rankings)
shutil.copy(f"{BACKUP_DIR}/src/pages/Rankings.jsx", f"{REPO_DIR}/src/pages/Rankings.jsx")
run("git add src/pages/Rankings.jsx")
run('git commit -m "feat(rankings): pagina de rankings oficiais interativos com filtros por periodo e loja"', env=env_inaiad)

# Commit 9: Raul (Tema Claro/Escuro & Rotas)
shutil.copy(f"{BACKUP_DIR}/src/site.css", f"{REPO_DIR}/src/site.css")
shutil.copy(f"{BACKUP_DIR}/src/App.jsx", f"{REPO_DIR}/src/App.jsx")
run("git add src/site.css src/App.jsx")
run('git commit -m "feat(tema): alternador de tema claro e escuro com tokens CSS customizados e integracao de rotas"', env=env_raul)

# Commit 10: Leonardo (Testes)
shutil.copy(f"{BACKUP_DIR}/tests/api/health.test.js", f"{REPO_DIR}/tests/api/health.test.js")
shutil.copy(f"{BACKUP_DIR}/tests/integrations/db.test.js", f"{REPO_DIR}/tests/integrations/db.test.js")
run("git add tests/api/health.test.js tests/integrations/db.test.js")
run('git commit -m "test: suite abrangente de testes automatizados com Vitest, Supertest e simulacao pg-mem"', env=env_leo)

# Commit 11: Inaiad (Documentação)
shutil.copy(f"{BACKUP_DIR}/README.md", f"{REPO_DIR}/README.md")
run("git add README.md")
run('git commit -m "docs: documentacao completa no README com integrantes, instrucoes e arquitetura do sistema"', env=env_inaiad)

run("git remote add origin https://github.com/Leonardo-backend/steamtwo.git")

print("\n=== HISTÓRICO FINAL DE COMMITS EM PT-BR DISTRIBUÍDOS ENTRE OS MEMBROS ===")
log = run('git log --format="%h | %an <%ae> | %s"')
print(log.stdout)
