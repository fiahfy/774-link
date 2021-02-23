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
    $ cli activity:update -s timeline -g animare
    $ cli activity:update -s video -m haneru-inaba
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
        source: {
          type: 'string',
          alias: 's',
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
  const { help, version, source, groupId, memberId } = cli.flags

  if (version) {
    return cli.showVersion()
  }
  if (help) {
    return cli.showHelp()
  }

  switch (command) {
    case 'activity:update': {
      switch (source) {
        case 'timeline': {
          const { updateActivitiesWithTimelines } = await import(
            './actions/update-activities-with-timelines'
          )
          await updateActivitiesWithTimelines(groupId)
          break
        }
        case 'video': {
          const { updateActivitiesWithVideos } = await import(
            './actions/update-activities-with-videos'
          )
          await updateActivitiesWithVideos(memberId)
          break
        }
        default:
          throw new Error(`Invalid Source: ${source}`)
      }
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
