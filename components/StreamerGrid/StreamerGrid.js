import React, { useEffect } from 'react'
import Image from 'next/image'
import styles from '../../styles/StreamerGrid.module.css'


const StreamerGrid = ({ channels, setChannel }) => {
  const setDBChannels = async channels => {
    try {
      const path = `https://${window.location.hostname}`

      const response = await fetch(`${path}/api/database`, {
        method: 'POST',
        body: JSON.stringify({
          key: 'CHANNELS',
          value: channels
        })
      })

      if (response.status === 200) {
        console.log(`Set ${channels} in DB`)
      }

    } catch (error) {
      console.warn(error.message)
      }
    }

    const removeChannelAction = channelId => async () => {
      console.log('removing channel...')

      const filteredChannels = channels.filter(channel => channel.id !== channelId)

      setChannel(filteredChannels)

      const joinChannels = filteredChannels.map(channel => channel.display_name.toLowerCase()).join(',')

      await setDBChannels(joinChannels)
  }

  const renderGridItem = channel => (
    <div key={channel.id} className={styles.gridItem}>
      <button onClick={removeChannelAction(channel.id)}>X</button>
      <Image layout="fill" src={channel.thumbnail_url} />
      <div className={styles.gridItemContent}>
        <p>{channel.display_name}</p>
        {channel.is_live && <p>live! :D</p>}
        {!channel.is_live && <p>offline</p>}
      </div>
    </div>
  )

  const renderNoItems = () => (
    <div className={styles.gridNoItems}>
      <p>you should probably add a streamer but what do I know <br></br>so heres a funny pic :D<br></br> jk wholesum frog :O</p>
      <video muted controls loop autoPlay src='pepe.mp4' width={250} >
      </video>
    </div>
  )

  useEffect(() => {
    console.log('CHANNELS: ', channels)
  }, [channels])


  return (
    <div className={styles.container}>
      <h2>Cool Twitch Dashboard</h2>
      <div className={styles.gridContainer}>
        {channels.length > 0 && channels.map(renderGridItem)}
        {channels.length === 0 && renderNoItems()}
      </div>
    </div>
  )
}

export default StreamerGrid