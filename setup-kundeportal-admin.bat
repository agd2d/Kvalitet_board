@echo off
echo Kloner Kundedashboard...
cd /d "C:\Users\jonat\Hvidbjerg Service"
git clone https://github.com/agd2d/Kundedashboard.git KundeAdmin_temp 2>/dev/null || (
  cd KundeAdmin_temp && git pull origin main && cd ..
)
cd KundeAdmin_temp
git checkout -b claude/kundeportal-admin 2>/dev/null || git checkout claude/kundeportal-admin

echo Opretter mapper...
mkdir "app\(dashboard)\kundeportal\bookinger" 2>/dev/null
mkdir "app\(dashboard)\kundeportal\opgaver" 2>/dev/null
mkdir "app\(dashboard)\kundeportal\beskeder" 2>/dev/null
mkdir "app\api\portal\tasks\employees" 2>/dev/null
mkdir "app\api\portal\messages" 2>/dev/null
mkdir "lib\supabase" 2>/dev/null

echo Kopierer filer fra serveren...
echo DONE - Filer mangler stadig at blive kopieret
pause
