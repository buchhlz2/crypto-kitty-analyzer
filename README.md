# CryptoKitties Blockchain Analyzer

Application allows a user to view some basic information about the live CryptoKitties contract deployed on the main Etherum net.

Users input a `startingBlock` and `endingBlock` as arguments, and the app returns the total number of births that happened during that range. That information is used to find the Kitty that gave birth to the most kitties -- information about this Kitty ("matron") includes its birth timestamp, generation, and its genes.

## Demo

Deployed on Heroku: [here](https://warm-oasis-05569.herokuapp.com/)
![](demo/crypto-kitties-demo.gif)

## Smart Contract Details

-   CryptoKitties contract on Etherscan: [0x06012c8cf97bead5deae237070f9587f8e7a266d](https://etherscan.io/txs?a=0x06012c8cf97bead5deae237070f9587f8e7a266d)
-   `Birth` event emitted every time a new Kitty is created
-   `getKitty()` => returns attributes about a Kitty, such as birth timestamp, generation, and its genes
-   Various read-only metadata is available with calls to public variables, such as `name`, `totalSupply`, `secondsPerBlock`, and `pregnantKitties`

## Available Scripts

In the root project directory, you can run:
`npm run start`
Runs the a React application.<br />

-   Open [http://localhost:3000](http://localhost:3000) to run frontend
