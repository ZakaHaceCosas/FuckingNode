{
  description = "FuckingNode Package";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      version = "2.2.1";
      downloadUrl = "https://github.com/ZakaHaceCosas/FuckingNode/releases/download/${version}/FuckingNode-linux_x86_64";
      sha256 = "1mg245lqnl6n96dwkcwc3x35sjhvihhcsklc99sg316g25xnhx2r";

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
          mkdir -p $out
          mkdir $out/bin
          cp $src $out/bin/fuckingnode
        '';

        fixupPhase = ''
          chmod +w $out/bin/fuckingnode
          chmod +x $out/bin/fuckingnode
        '';

        meta = {
          mainProgram = "fuckingnode";
        };
      };
    };
}

