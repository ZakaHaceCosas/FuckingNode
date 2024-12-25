{
  description = "FuckingNode Package";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      version = "1.4.2";
      downloadUrl = "https://github.com/ZakaHaceCosas/FuckingNode/releases/download/${version}/FuckingNode-linux_x86_64";
      sha256 = "18m51wqlq67cijwy38lvfz2lx4sbahjzdkq58rv4zqsigzylq4fl";

      pkgs = import nixpkgs {
        inherit system;
      };

    in {
      packages."${system}".default = pkgs.stdenv.mkDerivation {
        pname = "fuckingnode";
        inherit version;

        src = pkgs.fetchurl {
          url = downloadUrl;
          sha256 = sha256;
        };

        phases = [ "installPhase" "fixupPhase" ];

        nativeBuildInputs = [ pkgs.makeWrapper ];

        installPhase = ''
          mkdir -p $out/bin && cp -r $src/* $out/bin
        '';

        fixupPhase = ''
          chmod 755 $out/bin/*
          patchelf --set-interpreter "$(cat $NIX_CC/nix-support/dynamic-linker)" $out/bin/fuckingnode
        '';

        meta = {
          mainProgram = "fuckingnode";
        };
      };
    };
}

