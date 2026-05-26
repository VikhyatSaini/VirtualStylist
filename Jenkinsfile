pipeline {
    agent any

    environment {
        IMAGE_NAME = "vikhyat01/virtualstylist:v2"
    }

    stages {

        stage('Clone Repository') {
            steps {
                git 'https://github.com/VikhyatSaini/VirtualStylist.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $IMAGE_NAME .'
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {

                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'

                    sh 'docker push $IMAGE_NAME'
                }
            }
        }
    }
}