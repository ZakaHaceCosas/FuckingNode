import { FkNodeInterop } from "../src/commands/interop/interop.ts";
import { assertEquals } from "@std/testing";
import { APP_NAME, VERSION } from "../src/constants.ts";

Deno.test({
    name: "interop layer manages cargo pkg file",
    fn: () => {
        const commonPkgFile = FkNodeInterop.PackageFileParsers.Cargo.CPF(
            `
                [package]
    name =      "my_project"
version = "0.1.0"
    edition = "2021"
    publish = ["https://crates.io"]
    
    # See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html
    
    [dependencies]
    serde = "1.0"          # Dependency for serialization/deserialization
    reqwest = { version = "0.11", features = ["json"] }  # HTTP client library with JSON support
    tokio = { version = "1", features = ["full"] }      # Asynchronous runtime for Rust
    
    [dev-dependencies]
    criterion = "0.3"      # Library for benchmarking
    mockito = "0.31"       # Mock HTTP requests in tests
    
    [build-dependencies]
    bindgen = "0.59"       # Dependency for generating Rust bindings to C libraries
    
            `,
            [],
        );

        assertEquals(
            commonPkgFile,
            {
                name: "my_project",
                version: "0.1.0",
                rm: "cargo",
                deps: [
                    { name: "serde", ver: "1.0", rel: "univ:dep", src: "crates.io" },
                    { name: "reqwest", ver: "0.11", rel: "univ:dep", src: "crates.io" },
                    { name: "tokio", ver: "1", rel: "univ:dep", src: "crates.io" },
                    { name: "criterion", ver: "0.3", rel: "univ:devD", src: "crates.io" },
                    { name: "mockito", ver: "0.31", rel: "univ:devD", src: "crates.io" },
                    { name: "bindgen", ver: "0.59", rel: "rst:buildD", src: "crates.io" },
                ],
                ws: [],
                internal: {
                    fknode: VERSION,
                    fknodeCpf: "1.0.0",
                    fknodeIol: "1.0.0",
                },
            },
        );
    },
});

Deno.test({
    name: "interop layer manages golang pkg file",
    fn: () => {
        const commonPkgFile = FkNodeInterop.PackageFileParsers.Golang.CPF(
            `
             module vuelto.pp.ua

    go 1.18

    require (
        github.com/faiface/beep v1.1.0
        github.com/go-gl/glfw/v3.3/glfw v0.0.0-20231124074035-2de0cf0c80af
    )

    require (
        github.com/hajimehoshi/go-mp3 v0.3.0 // indirect
        github.com/hajimehoshi/oto v0.7.1 // indirect
        github.com/pkg/errors v0.9.1 // indirect
        golang.org/x/exp v0.0.0-20190306152737-a1d7652674e8 // indirect
        golang.org/x/image v0.18.0 // indirect
        golang.org/x/mobile v0.0.0-20190415191353-3e0bab5405d6 // indirect
        golang.org/x/sys v0.17.0 // indirect
    )

            `,
            "v1.1.0",
            [],
        );

        assertEquals(
            commonPkgFile,
            {
                name: "vuelto.pp.ua",
                version: "v1.1.0",
                rm: "golang",
                deps: [
                    {
                        name: "github.com/faiface/beep",
                        ver: "v1.1.0",
                        rel: "univ:dep",
                        src: "pkg.go.dev",
                    },
                    {
                        name: "github.com/go-gl/glfw/v3.3/glfw",
                        ver: "v0.0.0-20231124074035-2de0cf0c80af",
                        rel: "univ:dep",
                        src: "pkg.go.dev",
                    },
                    {
                        name: "github.com/hajimehoshi/go-mp3",
                        ver: "v0.3.0",
                        rel: "go:ind",
                        src: "pkg.go.dev",
                    },
                    {
                        name: "github.com/hajimehoshi/oto",
                        ver: "v0.7.1",
                        rel: "go:ind",
                        src: "pkg.go.dev",
                    },
                    {
                        name: "github.com/pkg/errors",
                        ver: "v0.9.1",
                        rel: "go:ind",
                        src: "pkg.go.dev",
                    },
                    {
                        name: "golang.org/x/exp",
                        ver: "v0.0.0-20190306152737-a1d7652674e8",
                        rel: "go:ind",
                        src: "pkg.go.dev",
                    },
                    {
                        name: "golang.org/x/image",
                        ver: "v0.18.0",
                        rel: "go:ind",
                        src: "pkg.go.dev",
                    },
                    {
                        name: "golang.org/x/mobile",
                        ver: "v0.0.0-20190415191353-3e0bab5405d6",
                        rel: "go:ind",
                        src: "pkg.go.dev",
                    },
                    {
                        name: "golang.org/x/sys",
                        ver: "v0.17.0",
                        rel: "go:ind",
                        src: "pkg.go.dev",
                    },
                ],
                ws: [],
                internal: {
                    fknode: VERSION,
                    fknodeCpf: "1.0.0",
                    fknodeIol: "1.0.0",
                },
            },
        );
    },
});

Deno.test({
    name: "interop layer manages node/bun CPF",
    fn: () => {
        const commonPkgFile = FkNodeInterop.PackageFileParsers.NodeBun.CPF(
            `
        {
        "name": "TEST",
        "version": "0.59.123",
        "dependencies": {
        "eslint": "^7.32.0",
        },  
        "devDependencies": {
            "typescript": "^4.4.3",
            },
        "peerDependencies": {
            "react": "^17.0.2",
        }
    }`,
            "pnpm",
            [],
        );

        assertEquals(
            commonPkgFile,
            {
                name: "TEST",
                version: "0.59.123",
                rm: "pnpm",
                deps: [
                    {
                        name: "eslint",
                        ver: "^7.32.0",
                        rel: "univ:dep",
                        src: "npm",
                    },
                    {
                        name: "typescript",
                        ver: "^4.4.3",
                        rel: "univ:devD",
                        src: "npm",
                    },
                    {
                        name: "react",
                        rel: "js:peer",
                        src: "npm",
                        ver: "^17.0.2",
                    },
                ],
                ws: [],
                internal: {
                    fknode: VERSION,
                    fknodeCpf: "1.0.0",
                    fknodeIol: "1.0.0",
                },
            },
        );
    },
});

Deno.test({
    name: "interop layer manages deno CPF",
    fn: () => {
        const commonPkgFile = FkNodeInterop.PackageFileParsers.Deno.CPF(
            `{
    "name": "${APP_NAME.SCOPE}",
    "version": "3.0.0-alpha",
    "imports": {
        "@std/fs": "jsr:@std/fs@^1.0.10",
    },
    "lock": true
}
`,
            [],
        );

        assertEquals(
            commonPkgFile,
            {
                name: APP_NAME.SCOPE,
                version: "3.0.0-alpha",
                rm: "deno",
                deps: [
                    {
                        name: "@std/fs",
                        ver: "^1.0.10",
                        rel: "univ:dep",
                        src: "jsr",
                    },
                ],
                ws: [],
                internal: {
                    fknode: VERSION,
                    fknodeCpf: "1.0.0",
                    fknodeIol: "1.0.0",
                },
            },
        );
    },
});
