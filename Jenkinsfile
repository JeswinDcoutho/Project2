pipeline {
    agent any

    environment {
        IMAGE_NAME = "jeswindcoutho/nodejs-devops-project"
        NAMESPACE = "nodejs-devops"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Git') {
            steps {
                git url: 'https://github.com/JeswinDcoutho/Project2.git',
                    branch: 'master'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build \
                        --build-arg APP_VERSION=${IMAGE_TAG}.0 \
                        -t ${IMAGE_NAME}:${IMAGE_TAG} .
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login \
                            -u "$DOCKER_USER" \
                            --password-stdin

                        docker push ${IMAGE_NAME}:${IMAGE_TAG}
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                    echo "Kubernetes nodes:"
                    kubectl get nodes

                    echo "Updating stable deployment..."

                    kubectl set image deployment/nodejs-app \
                        nodejs-app=${IMAGE_NAME}:${IMAGE_TAG} \
                        -n ${NAMESPACE}

                    echo "Waiting for rolling update..."

                    kubectl rollout status deployment/nodejs-app \
                        -n ${NAMESPACE}
                '''
            }
        }

        stage('Check Deployment') {
            steps {
                sh '''
                    echo "Deployments:"
                    kubectl get deployments -n ${NAMESPACE}

                    echo "Pods:"
                    kubectl get pods -n ${NAMESPACE}

                    echo "Services:"
                    kubectl get services -n ${NAMESPACE}

                    echo "Docker image:"
                    kubectl get deployment nodejs-app \
                        -n ${NAMESPACE} \
                        -o jsonpath='{.spec.template.spec.containers[0].image}'
                    echo
                '''
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
        }
    }
}
