pipeline {
  agent any
  stages {
    stage('Hello') {
      steps {
        echo 'Hello World'
      }
    }
    stage('Test') {
      steps {
        echo 'make check'
      }
    }
    stage('Deploy') {
      when { tag "release-*" }
      steps {
        echo 'Deploying ...'
      }
    }
  }
}
