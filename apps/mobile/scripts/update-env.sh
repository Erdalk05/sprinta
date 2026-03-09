#!/bin/bash
# Mac'in aktif WiFi IP'sini otomatik alır ve .env'i günceller
# Kullanım: bash scripts/update-env.sh
# iOS fiziksel cihaz için pnpm ios:local komutu bu scripti otomatik çalıştırır.

LOCAL_IP=$(ipconfig getifaddr en0)
if [ -z "$LOCAL_IP" ]; then
  LOCAL_IP=$(ipconfig getifaddr en1)
fi
if [ -z "$LOCAL_IP" ]; then
  echo "⚠️  WiFi IP bulunamadı, 127.0.0.1 kullanılıyor (simülatör modu)"
  LOCAL_IP="127.0.0.1"
fi

ENV_FILE="/Users/erdalkiziroglu/sprinta-22-subat-2026/apps/mobile/.env"
sed -i '' "s|EXPO_PUBLIC_SUPABASE_URL=http://[0-9.]*:54321|EXPO_PUBLIC_SUPABASE_URL=http://${LOCAL_IP}:54321|g" "$ENV_FILE"
echo "✅ Supabase URL güncellendi: http://${LOCAL_IP}:54321"
