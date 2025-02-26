import React from "react";
import PhaserGames from "../Components/PhaserGames";
import Head from "next/head";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Lords of Memes and Magic</title>
        <meta name="description" content="My Game" />
        <link rel="icon" href="/icon.svg" />
      </Head>
      <PhaserGames />
    </div>
  );
}
