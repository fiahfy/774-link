import dotenv from 'dotenv'
import meow from 'meow'

dotenv.config({ path: '../.env.local' })

const main = async () => {
  const cli = meow(
    `
	Usage: cli <command> [options]
	Options:
    -v, --version   output the version number
    -h, --help      output usage information
	Examples:
    $ cli fetch-timelines
`,
    {
      flags: {
        help: {
          type: 'boolean',
          default: false,
          alias: 'h',
        },
        version: {
          type: 'boolean',
          default: false,
          alias: 'v',
        },
        groupId: {
          type: 'string',
          alias: 'g',
        },
        memberId: {
          type: 'string',
          alias: 'm',
        },
      },
    }
  )

  const [command] = cli.input
  const { help, version, groupId, memberId } = cli.flags

  if (version) {
    return cli.showVersion()
  }
  if (help) {
    return cli.showHelp()
  }

  switch (command) {
    case 'fetch-timelines': {
      const { fetchTimelines } = await import('./actions/fetch-timelines')
      await fetchTimelines(groupId)
      break
    }
    case 'fetch-videos': {
      const { fetchVideos } = await import('./actions/fetch-videos')
      await fetchVideos(memberId)
      break
    }
    default:
      throw new Error(`Invalid Command: ${command}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
