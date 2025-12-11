# 🚀 Installation Automatique des Extensions

## Installation via Terminal

### Option 1 : Script Automatique (Recommandé)

```bash
./install-extensions.sh
```

### Option 2 : Installation Manuelle

Si le script ne fonctionne pas, installez manuellement :

**Pour Cursor:**
```bash
cursor --install-extension dbaeumer.vscode-eslint
cursor --install-extension esbenp.prettier-vscode
cursor --install-extension bradlc.vscode-tailwindcss
# ... etc
```

**Pour VSCode:**
```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
# ... etc
```

## Liste Complète des Extensions

1. `dbaeumer.vscode-eslint` - ESLint
2. `esbenp.prettier-vscode` - Prettier
3. `bradlc.vscode-tailwindcss` - Tailwind CSS IntelliSense
4. `ms-vscode.vscode-typescript-next` - TypeScript
5. `eamodio.gitlens` - GitLens
6. `usernamehw.errorlens` - Error Lens
7. `formulahendry.auto-rename-tag` - Auto Rename Tag
8. `christian-kohler.path-intellisense` - Path IntelliSense
9. `ms-vscode.vscode-json` - JSON
10. `supabase.supabase-vscode` - Supabase
11. `dsznajder.es7-react-js-snippets` - React Snippets
12. `orta.vscode-jest` - Jest

## Activation

Les extensions sont automatiquement activées après installation. Pour recharger :

1. **Via Palette de Commandes:**
   - `Cmd+Shift+P` (Mac) ou `Ctrl+Shift+P` (Windows)
   - Tapez: `Developer: Reload Window`

2. **Via Menu:**
   - Menu > Developer > Reload Window

## Vérification

Pour vérifier les extensions installées :

```bash
# Cursor
cursor --list-extensions

# VSCode
code --list-extensions
```

## Dépannage

Si les extensions ne s'installent pas :

1. Vérifiez que Cursor/VSCode est installé
2. Ajoutez le chemin CLI au PATH :
   ```bash
   # Pour Cursor (macOS)
   export PATH="$PATH:/Applications/Cursor.app/Contents/Resources/app/bin"
   
   # Pour VSCode (macOS)
   export PATH="$PATH:/Applications/Visual Studio Code.app/Contents/Resources/app/bin"
   ```
3. Redémarrez le terminal
4. Réessayez le script
