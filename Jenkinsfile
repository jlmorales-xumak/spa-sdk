/*
 * Copyright 2020 Hippo B.V. (http://www.onehippo.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

pipeline {
  agent {
    docker {
      label 'docker'
      image 'node:14'
      args '-v  /etc/passwd:/etc/passwd'
    }
  }

  options {
    gitLabConnection('https://code.bloomreach.com/')
  }

  triggers {
    gitlab(
      triggerOnPush: true,
      pendingBuildName: 'SPA SDK'
    )
  }

  stages {
    stage('Build, Lint & Test') {
      steps {
        sh 'HOME=$(pwd) yarn'
        sh 'yarn build'
        sh 'yarn lint'
        sh 'yarn test'
      }
    }

    stage('Release') {
      when {
        branch 'main'
        tag 'spa-sdk-*'
      }

      stages {
        stage('Publish to NPM') {
          steps {
            withCredentials([[$class: 'StringBinding', credentialsId: 'NPM_AUTH_TOKEN', variable: 'YARN_NPM_AUTH_TOKEN']]) {
              sh 'yarn release'
            }
          }
        }

        stage('Publish to GitHub') {
          steps {
            sh 'git remote add github git@github.com:bloomreach/spa-sdk.git'
            sshagent (credentials: ['spa-sdk-github']) {
              sh 'git push github ${TAG_NAME}'
            }
          }
        }
      }
    }
  }
}
