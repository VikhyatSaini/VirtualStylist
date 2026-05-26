pipeline {
    agent any

    environment {
        IMAGE_NAME = "vikhyat01/virtualstylist:v2"
    }

    stages {


        stage('Build Docker Image') {
            steps {
                sh 'sudo docker build -t $IMAGE_NAME .'
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {

                    sh 'echo $DOCKER_PASS | sudo docker login -u $DOCKER_USER --password-stdin'

                    sh 'sudo docker push $IMAGE_NAME'
                }
            }
        }
    }
}