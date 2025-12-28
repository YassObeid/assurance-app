@echo off
echo ========================================
echo   Assurance App - Demarrage Windows
echo ========================================
echo.

echo [1/3] Demarrage des containers Docker...
docker-compose up -d --build
if %ERRORLEVEL% neq 0 (
    echo ERREUR: Docker n'est pas installe ou n'est pas demarre.
    echo Installez Docker Desktop: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo.
echo [2/3] Attente du demarrage de la base de donnees (15 secondes)...
timeout /t 15 /nobreak > nul

echo.
echo [3/3] Configuration de la base de donnees...
docker exec assurance-api npx prisma migrate deploy
docker exec assurance-api npm run seed:prod

echo.
echo ========================================
echo   APPLICATION PRETE!
echo ========================================
echo.
echo Frontend: http://localhost:3001
echo API:      http://localhost:3000
echo.
echo Comptes de test:
echo   GM:          gm@example.com / gm123456
echo   Manager Sud: manager.south@example.com / manager123_3
echo   Manager Nord: manager.north@example.com / manager123_2
echo.
echo Pour arreter: docker-compose down
echo ========================================
pause
