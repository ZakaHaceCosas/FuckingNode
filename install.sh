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

        echo "#!/bin/bash" >"$script_path"
        echo "\"\$(dirname \"\$0\")/$CLI_NAME\" $cmd \"\$@\"" >>"$script_path"

        chmod +x "$script_path"

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
    if echo "$PATH" | grep -q "$INSTALL_DIR"; then
        echo "$INSTALL_DIR is already in PATH."
        return
    fi

    # add to PATH
    echo "export PATH=\"$INSTALL_DIR:\$PATH\"" >>~/.bash_profile
    # ensure the new PATH is applied immediately
    source ~/.bash_profile
    # do the same with bashrc
    echo "export PATH=\"$INSTALL_DIR:\$PATH\"" >>~/.bashrc
    source ~/.bashrc
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
