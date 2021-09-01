// This is where all the logic for your Twitch API will live!
const HOST_NAME = 'https://api.twitch.tv/helix'

export default async (req, res) => {
  try {
    if (req.method === 'POST') {
      const { data } = req.body
      if (data) {
        const channelData = await getTwitchChannel(data)
        if (channelData) {
          console.log("channel data:  ", channelData)
          res.status(200).json({ data: channelData })
        }

      }
      res.status(404).send()
    }
  } catch (error) {
    console.warn(error.message)
    res.status(500).send()
  }
}

const getTwitchChannel = async channelName => {
  if (channelName) {
    const accessToken = await getTwitchAccessToken()
    //so it is ez to find later
    if (accessToken) {
      const response = await fetch(`${HOST_NAME}/search/channels?query=${channelName}`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Client-Id": process.env.TWITCH_CLIENT_ID}
        })

      const json = await response.json()
      console.log('are we gfetting the json', json)

      if (json.data) {
        const { data } = json

        const lowerChannelName = channelName.toLowerCase()

        const foundChannel = data.find(channel => {
          const lowerTwitchChannelName = channel.display_name.toLowerCase()

          return lowerChannelName === lowerTwitchChannelName
        })

        return foundChannel

      }
    }
    throw new Error('twitch accessToken was undefined')
  }
  throw new Error('no channel name')
}


const getTwitchAccessToken = async () => {
  
  const path=`https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_SECRET_ID}&grant_type=client_credentials`
  
  const response = await fetch(path, {
    method: 'POST'
  })
  console.log('Response from fetching access token:', response)
  console.log(process.env.TWITCH_SECRET_ID)
  
  if (response) {
    const json = await response.json()

    return json.access_token
    console.log('working', json)
  }
}