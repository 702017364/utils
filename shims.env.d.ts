declare namespace NodeJS { 
  interface ProcessEnv { 
    npm_config_type?: 'test' | 'default'
  }
}