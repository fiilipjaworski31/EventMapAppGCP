# Użyj oficjalnego, stabilnego obrazu Node.js
FROM node:18-alpine

# Ustaw katalog roboczy wewnątrz kontenera
WORKDIR /usr/src/app

# Skopiuj pliki package.json i package-lock.json
COPY package*.json ./

# Zainstaluj wszystkie zależności produkcyjne
RUN npm install --only=production

# Skopiuj resztę kodu aplikacji (w tym kluczowy folder 'src')
COPY . .

# Zdefiniuj komendę, która uruchomi aplikację za pomocą skryptu z package.json
CMD [ "npm", "start" ]