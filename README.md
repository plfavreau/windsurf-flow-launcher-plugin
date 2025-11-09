<div align="center">
  <img src="icon.png" alt="Windsurf Workspaces" width="120"/>
  
  # Windsurf Workspaces Plugin for Flow Launcher
</div>

A Flow Launcher plugin to quickly find and open recent Windsurf workspaces and remote SSH machines.

## Features

- 🔎 **Quick Search**: Open recent Windsurf workspaces with just a few keystrokes
- 🌐 **Remote Support**: Connect to SSH remote machines configured in Windsurf
- 💾 **Cached Results**: Fast performance with caching

## Installation

### Prerequisites

- [Flow Launcher](https://www.flowlauncher.com/) installed
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Windsurf](https://windsurf.com/) installed

### Steps

1. Clone or download this repository
2. Navigate to the plugin directory:
   ```bash
   cd flow-plugin-windsurf
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build the plugin:
   ```bash
   npm run build
   ```
5. Zip the entire repository
6. In Flow Launcher > Plugins Store > Install from file, select the zip file
7. Restart Flow Launcher

## Usage

1. Open Flow Launcher (default: `Alt + Space`)
2. Type `w` (or your configured action keyword) followed by a space
3. Start typing to filter workspaces:
   - Type part of a workspace name or path
   - Select a workspace and press Enter to open it in Windsurf

## Configuration

The plugin automatically detects:

- Windsurf installation location
- Recent workspace history from Windsurf's database
- SSH remote machines from your SSH config

## How It Works

The plugin:

1. Locates Windsurf installations on your system
2. Reads workspace history from Windsurf's SQLite database (`state.vscdb`)
3. Parses SSH configuration for remote machines
4. Caches results for fast subsequent queries
5. Launches Windsurf with the selected workspace URI

## Troubleshooting

### Plugin doesn't show any workspaces

- Ensure Windsurf is installed and you've opened at least one workspace
- Check that the Windsurf executable is in your PATH or in a standard location
- Verify the AppData folder exists: `%APPDATA%\Windsurf`

### Remote machines not showing

- Ensure you have SSH remote machines configured in Windsurf
- Check that `remote.SSH.configFile` is set in Windsurf's settings.json
- Verify your SSH config file exists and is properly formatted

## License

MIT
