#!/bin/bash

# i'll clarify - i didn't write most of this, i just copied stuff from places
# i'm no sh-er. if it doesn't work i accept any bonk (and any PR too)

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
        grep -o '"browser_download_url": "[^"]*' |
        grep "$platform_arch" |
        sed 's/"browser_download_url": "//')

    if [ -z "$URL" ]; then
        echo "No matching file found for $platform_arch. This is likely our fault for not properly naming executables, please raise an issue."
        exit 1
    fi

    echo "Fetched successfully."
    echo "$URL"
}

# install
install_app() {
    local url=$1
    echo "Downloading..."
    sudo mkdir -p "$INSTALL_DIR"
    curl -L "$url" -o "$EXE_PATH"
    echo "Downloaded successfully to $EXE_PATH"
}

# make shortcuts
create_shortcuts() {

    echo "Creating shortcuts for CLI..."

    if [[ -z "$INSTALL_DIR" || ! -d "$INSTALL_DIR" ]]; then
        echo "Error: Install directory '$INSTALL_DIR' does not exist or is not defined."
        exit 1
    fi

    # all aliases should be
    # (appName).exe <a command> [ANY ARGS PASSED]
    # so e.g. fkclean "b" = (appName) <command> "b"

    declare -A commands=(
        ["fknode"]=""
        ["fkn"]=""
        ["fkclean"]="clean"
        ["fkstart"]="kickstart"
        ["fkcommit"]="commit"
        ["fkrelease"]="release"
        ["fksurrender"]="surrender"
        ["fkadd"]="manager add"
        ["fkrem"]="manager remove"
    )

    for name in "${!commands[@]}"; do
        cmd=${commands[$name]}
        script_path="$INSTALL_DIR/$name.sh"

        echo "#!/bin/bash" | sudo tee "$script_path" >/dev/null
        echo "\"\$(dirname \"\$0\")/$CLI_NAME\" $cmd \"\$@\"" | sudo tee -a "$script_path" >/dev/null

        sudo chmod +x "$script_path"

        echo "Shortcut created successfully at $script_path"
    done
}

# add app to path
add_app_to_path() {
    echo "Adding shorthand to PATH..."

    if [ -z "$INSTALL_DIR" ]; then
        echo "Install directory is undefined or empty."
        exit 1
    fi

    # check if it's already in PATH
    if [[ ":$PATH:" == *":$INSTALL_DIR:"* ]]; then
        echo "$INSTALL_DIR is already in PATH."
        return
    fi

    # define target files
    FILES=("$HOME/.bashrc" "$HOME/.bash_profile" "$HOME/.profile")

    # append to each file if it exists and doesn't already contain the entry
    for file in "${FILES[@]}"; do
        if [ -f "$file" ]; then
            if ! grep -q "export PATH=\"$INSTALL_DIR:\$PATH\"" "$file"; then
                echo "export PATH=\"$INSTALL_DIR:\$PATH\"" >>"$file"
                MODIFIED=true
            else
                echo "$INSTALL_DIR is already in $file."
            fi
        fi
    done

    # apply changes if any file was modified
    if [ "$MODIFIED" = true ]; then
        source "$HOME/.profile" 2>/dev/null
        source "$HOME/.bashrc" 2>/dev/null
        source "$HOME/.bash_profile" 2>/dev/null
        echo "Successfully added $INSTALL_DIR to PATH."
    else
        echo "No config files were modified."
    fi
}

# installer itself
installer() {
    echo "Hi! We'll install $STYLED_NAME for you. Just a sec!"
    echo "Please note we'll use sudo a lot (many files to be created)"
    echo "They're all found at $INSTALL_DIR."
    URL=$(get_latest_release_url)
    install_app "$URL"
    create_shortcuts
    add_app_to_path
    echo "Installed successfully! Restart your terminal for it to work."
}

# less go
installer
