Open source clone of [bl.ocks.org](https://bl.ocks.org/), hosted at [blocks.roadtolarissa.com](https://blocks.roadtolarissa.com).

# dev

`yarn && yarn dev`

If you've installed [gistup](https://github.com/mbostock/gistup), http://localhost:3002/$yourUsername will include your private gists. 

To view your private gists without running locally, run `cat ~/.gistup.json` to get your token, and go to `https://blocks.roadtolarissa.com/$yourUsername?token=$token`