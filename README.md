# Chuck Norris Facts - Recherche

Moteur de recherche temps réel sur 10 527 Chuck Norris facts issus de [chucknorrisfacts.fr](https://www.chucknorrisfacts.fr/).

Hommage à Chuck Norris (1940 — 2026).

## Demo

[qiwi.ch/norris](https://qiwi.ch/norris)

## Fonctionnalités

- Recherche temps réel par mot-clé avec debounce (multi-mots)
- Mise en gras des termes recherchés dans les résultats
- Fact aléatoire avec navigation (boutons ou flèches clavier)
- Lazy loading infini des résultats (par paquets de 50, avec fade-in)
- Copie d'un fact en un clic
- Affichage de la note /10
- Affichage 2 colonnes (desktop) / 1 colonne (mobile)
- 100% côté client, aucun backend requis

## Stack

- HTML + CSS + JS vanilla
- JSON statique (1.3 Mo, 10 527 facts)
- Recherche via `Array.filter()` (< 5ms sur 10k entrées)

## Utilisation

Servir depuis n'importe quel serveur HTTP :

```bash
python -m http.server 8000
# ou
php -S localhost:8000
```

## Structure

```
├── index.html        # Page principale
├── facts.json        # Base de facts (id, texte, note)
├── css/
│   └── style.css     # Thème Texas Ranger
├── js/
│   └── app.js        # Recherche, random, lazy load
└── api/
    └── add.php       # Endpoint d'ajout de fact (PHP)
```
