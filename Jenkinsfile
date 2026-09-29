pipeline {
    agent any

    environment {
        IMAGE_NAME = "jeswindcoutho/nodejs-devops-project"
        NAMESPACE = "nodejs-devops"
        ROLLOUT_NAME = "nodejs-app-rollout"
        IMAGE_TAG = "${BUILD_NUMBER}"
        APP_VERSION = "${BUILD_NUMBER}.0"
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
                    echo "Building Docker image..."
                    echo "Application version: ${APP_VERSION}"

                    docker build \
                        --build-arg APP_VERSION=${APP_VERSION} \
                        -t ${IMAGE_NAME}:${IMAGE_TAG} .
                '''
            }
        }

        stage('Load Image into Minikube') {
            steps {
                sh '''
                    echo "Loading image into Minikube..."

                    minikube image load \
                        ${IMAGE_NAME}:${IMAGE_TAG}
                '''
            }
        }

        stage('Deploy to Argo Rollout') {
            steps {
                sh '''
                    echo "Kubernetes nodes:"
                    kubectl get nodes

                    echo "Updating Argo Rollout..."

                    kubectl argo rollouts set image \
                        ${ROLLOUT_NAME} \
                        nodejs-app=${IMAGE_NAME}:${IMAGE_TAG} \
                        -n ${NAMESPACE}

                    echo "Waiting for Argo Rollout..."

                    kubectl argo rollouts status \
                        ${ROLLOUT_NAME} \
                        -n ${NAMESPACE} \
                        --timeout 5m
                '''
            }
        }

        stage('Check Deployment') {
            steps {
                sh '''
                    echo "================================"
                    echo "Argo Rollout"
                    echo "================================"

                    kubectl argo rollouts get rollout \
                        ${ROLLOUT_NAME} \
                        -n ${NAMESPACE}

                    echo "================================"
                    echo "Pods"
                    echo "================================"

                    kubectl get pods \
                        -n ${NAMESPACE} \
                        -l app=nodejs-rollout

                    echo "================================"
                    echo "Services"
                    echo "================================"

                    kubectl get services \
                        -n ${NAMESPACE}

                    echo "================================"
                    echo "Application Image"
                    echo "================================"

                    kubectl get rollout ${ROLLOUT_NAME} \
                        -n ${NAMESPACE} \
                        -o jsonpath='{.spec.template.spec.containers[0].image}'

                    echo
                '''
            }
        }
    }
}
