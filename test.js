import yts from "yt-search"

const REGEX = /(?:https?:\/\/)?(:www|:music)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[-a-zA-Z0-9_]{11,}(?!\S))\/)|(?:\S*v=|v\/)))([-a-zA-Z0-9_]{11,})/
const SHORT_REGEX = /^.*(youtu.be\/|list=)([^#\&\?]*).*/


async function run() {
  let value = "https://music.youtube.com/watch?v=ftyejLY-phA&list=RDAMVMftyejLY-phA"

  let result
  
  const playlist_info = SHORT_REGEX.exec(value)
  const video_info = REGEX.exec(value)
  
  if (playlist_info && !video_info) {
    const rex_id = SHORT_REGEX.exec(value)
    result = (await yts({ listId: rex_id[2] }))
  } else if (video_info) {
    const rex_id = REGEX.exec(value)
    console.log(rex_id)
    result = await yts({ videoId: rex_id[2] })
  } else {
    result = [(await yts(value)).videos[0]]
  }
  const tracks = result.videos ? result.videos : result

  console.log(tracks)
}

run()