import { readFileSync } from 'fs'
import * as yaml from 'js-yaml'
import { join } from 'path'

const yamlFilename = '../../../config.yml'

export default () => {
  return yaml.load(readFileSync(join(yamlFilename), 'utf8')) as Record<string, any>
}