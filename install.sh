#!/bin/bash

# i'll clarify - i didn't write nearly any of this, i just copied stuff from places
# i'm no sh-er
# if it doesn't work i accept any bonk (and any PR too)

# constants
APP_NAME="FuckingNode"
CLI_NAME="fuckingnode"
STYLED_NAME="F*ckingNode"
REPO="ZakaHaceCosas/$APP_NAME"
INSTALL_DIR="/usr/local/$APP_NAME"
EXE_PATH="$INSTALL_DIR/$CLI_NAME"

# get where we are so it knows what to use
get_platform_arch() {
    case "$(uname -s)" in
    Darwin)
        case "$(uname -m)" in
        arm64)
            echo "darwinArm"
            ;;
        x86_64)
            echo "darwin64"
            ;;
        *)
            echo "Unsupported macOS architecture."
            exit 1
            ;;
        esac
        ;;
    Linux)
        case "$(uname -m)" in
        armv7l)
            echo "linuxArm"
            ;;
        x86_64)
            echo "linux64"
            ;;
        *)
            echo "Unsupported Linux architecture."
            exit 1
            ;;
        esac
        ;;
    *)
        echo "Unsupported operating system, are you on TempleOS or wth?"
        exit 1
        ;;
    esac
}

# get url
get_latest_release_url() {
    platform_arch=$(get_platform_arch)
    echo "Fetching latest release for $platform_arch from GitHub..."
    URL=$(curl -s "https://api.github.com/repos/$REPO/releases/latest" |
        jq -r ".assets[] | select(.name | contains(\"$platform_arch\")) | .browser_download_url")

    if [ -z "$URL" ]; then
        echo "No matching file found for $platform_arch."
        exit 1
    fi
    echo "Fetched."
    echo "$URL"
}

# install
install_app() {
    local url=$1
    echo "Downloading..."
    mkdir -p "$INSTALL_DIR"
    curl -L "$url" -o "$EXE_PATH"
    echo "Downloaded successfully to $EXE_PATH"
}

# make shortcuts
create_shortcuts() {
    installDir=$1
    appName=$2

    echo "Creating shortcuts for the CLI..."

    # fknode (any args)
    echo -e "#!/bin/bash\n$installDir/$appName \"\$@\"" > "$installDir/fknode"
    chmod +x "$installDir/fknode"
    echo "Shortcut created successfully at $installDir/fknode"

    # fkn (any args)
    echo -e "#!/bin/bash\n$installDir/$appName \"\$@\"" > "$installDir/fknode"
    chmod +x "$installDir/fknode"
    echo "Shortcut created successfully at $installDir/fkn"

    # fkclean (no args)
    echo -e "#!/bin/bash\n$installDir/$appName clean \"\$@\"" > "$installDir/fkclean"
    chmod +x "$installDir/fkclean"
    echo "Shortcut created successfully at $installDir/fkclean"

    # fkstart (1-3 string args)
    echo -e "#!/bin/bash\nif [ -z \"\$1\" ]; then echo \"Error: No Git URL provided!\"; exit 1; else $installDir/$appName kickstart \"\$1\" \"\$2\" \"\$3\"; fi" > "$installDir/fkstart"
    chmod +x "$installDir/fkstart"
    echo "Shortcut created successfully at $installDir/fkstart"

    # fkcommit (1 string arg)
    echo -e "#!/bin/bash\nif [ -z \"\$1\" ]; then echo \"Error: No commit message provided!\"; exit 1; else $installDir/$appName commit \"\$1\"; fi" > "$installDir/fkcommit"
    chmod +x "$installDir/fkcommit"
    echo "Shortcut created successfully at $installDir/fkcommit"

    # fkadd (1 string arg)
    echo -e "#!/bin/bash\nif [ -z \"\$1\" ]; then echo \"Error: No argument provided!\"; exit 1; else $installDir/$appName manager add \"\$1\"; fi" > "$installDir/fkadd"
    chmod +x "$installDir/fkadd"
    echo "Shortcut created successfully at $installDir/fkadd"

    # fkrem (1 string arg)
    echo -e "#!/bin/bash\nif [ -z \"\$1\" ]; then echo \"Error: No argument provided!\"; exit 1; else $installDir/$appName manager remove \"\$1\"; fi" > "$installDir/fkrem"
    chmod +x "$installDir/fkrem"
    echo "Shortcut created successfully at $installDir/fkrem"
}

# add app to path
add_app_to_path() {
    echo "Adding shorthand to PATH..."

    if [ -z "$INSTALL_DIR" ]; then
        echo "Install directory is undefined or empty."
        exit 1
    fi

    # check if it's already in PATH
    if echo "$PATH" | grep -q "$INSTALL_DIR"; then
        echo "$INSTALL_DIR is already in PATH."
        return
    fi

    # add to PATH
    echo "export PATH=\"$INSTALL_DIR:\$PATH\"" >>~/.bash_profile
    # ensure the new PATH is applied immediately
    source ~/.bash_profile
    echo "Successfully added $INSTALL_DIR to PATH."
}

# installer itself
installer() {
    echo "Hi! We'll install $STYLED_NAME for you. Just a sec!"
    URL=$(get_latest_release_url)
    install_app "$URL"
    create_shortcuts
    add_app_to_path
    echo "Installed successfully! Restart your terminal for it to work."
}

# less go
installer
