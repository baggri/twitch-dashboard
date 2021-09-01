// Main entry point of your app
import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import StreamerGrid from '../components/StreamerGrid/StreamerGrid'


const Home = () => {
  const [favoriteChannels, setFavoriteChannels] = useState([])
  const [isLoading, setIsLoading] = useState(false)


  const addStreamChannel = async event => {
    event.preventDefault()

    const { value } = event.target.elements.name

    if (value) {
      console.log('Input: ', value)

      const path = `https://${window.location.hostname}`

      const response = await fetch(`${path}/api/twitch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: value })
      })

      const json = await response.json()
      console.log("From the server: ", json.data)

      setFavoriteChannels(prevState => [...prevState, json.data]);

      await setChannel(value)

      event.target.elements.name.value = ""
    }
  }

  const fetchChannels = async () => {
    try {
      setIsLoading(true)

      const path = `https://${window.location.hostname}`

      console.log('path for DB request: ', path)

      const response = await fetch(`${path}/api/database`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'GET_CHANNELS',
          key: 'CHANNELS'
        })
      })

      if (response.status === 404) {
        console.warn("channels key not found :/")
        setIsLoading(false)
        return
      }

      const json = await response.json()
      const channelData = []

      if (json.data) {
        const channelNames = json.data.split(',')

        for await (const channelName of channelNames) {

          const channelResp = await fetch(`${path}/api/twitch`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              data: channelName
            })
          })

          const json = await channelResp.json()

          if (json.data) {
            channelData.push(json.data)
          }

        }
      }

      setFavoriteChannels(channelData)

      setIsLoading(false)

    } catch (error) {
      setIsLoading(false)
      console.warn(error.message)
    }
  }


  const setChannel = async channelName => {
    try {
      const currentStreamers = favoriteChannels.map(channel => channel.display_name.toLowerCase())

      const streamerList = [...currentStreamers, channelName].join(",")
      const path = `https://${window.location.hostname}`

      const response = await fetch(`${path}/api/database`, {
        method: 'POST',
        body: JSON.stringify({
          key: 'CHANNELS',
          value: streamerList
        })
      })

      if (response.status === 200) {
        console.log(`Set ${streamerList} in DB`)
      }

    } catch (error) {
      console.warn(error.message)
    }
  }

  // Render Method
  const renderForm = () => (
    <div className={styles.formContainer}>
      <form onSubmit={addStreamChannel}>
        <input id="name" placeholder="any streamer name" type="text" required />
        <button className={styles.button} type="submit">Add Streamer</button>
      </form>
    </div>
  )

  useEffect(() => {
    console.log('checking DB......')
    fetchChannels()
  }, [])

  return (
    <div className={styles.container}>
      <Head>
        <title>Twitch Dashboard</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className={styles.inputContainer}>
        {renderForm()}
        {isLoading && <div className={styles.loadingIndicator}>
        <p>loading PLEASE WAIT.. <br></br>pwetty pwees</p>
        </div>}
        <StreamerGrid channels={favoriteChannels} setChannel={setFavoriteChannels} />
      </div>
    </div>
  )
}
export default Home