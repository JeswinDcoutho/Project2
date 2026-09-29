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

        stage('Create Kubernetes Namespace') {
            steps {
                sh '''
                    echo "Creating namespace if it does not exist..."

                    kubectl create namespace ${NAMESPACE} \
                        --dry-run=client \
                        -o yaml | kubectl apply -f -

                    kubectl get namespace ${NAMESPACE}
                '''
            }
        }

        stage('Apply Kubernetes Resources') {
            steps {
                sh '''
                    echo "Applying Argo Rollout resources..."

                    kubectl apply -f k8s/rollout-stable-service.yaml
                    kubectl apply -f k8s/rollout-canary-service.yaml
                    kubectl apply -f k8s/rollout-ingress.yaml
                    kubectl apply -f k8s/rollout.yaml

                    echo "Kubernetes resources:"
                    kubectl get rollout,services,ingress -n ${NAMESPACE}
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    echo "================================"
                    echo "Building Docker Image"
                    echo "================================"

                    echo "Image: ${IMAGE_NAME}:${IMAGE_TAG}"
                    echo "Application version: ${APP_VERSION}"

                    docker build \
                        --build-arg APP_VERSION=${APP_VERSION} \
                        -t ${IMAGE_NAME}:${IMAGE_TAG} .
                '''
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub',
                        passwordVariable: 'DOCKER_PASS',
                        usernameVariable: 'DOCKER_USER'
                    )
                ]) {
                    sh '''
                        echo "================================"
                        echo "Logging in to Docker Hub"
                        echo "================================"

                        echo "$DOCKER_PASS" | docker login \
                            -u "$DOCKER_USER" \
                            --password-stdin

                        echo "Tagging Docker image..."

                        docker tag \
                            ${IMAGE_NAME}:${IMAGE_TAG} \
                            "$DOCKER_USER/nodejs-devops-project:${IMAGE_TAG}"

                        echo "Pushing Docker image..."

                        docker push \
                            "$DOCKER_USER/nodejs-devops-project:${IMAGE_TAG}"

                        echo "Docker image pushed successfully."
                    '''
                }
            }
        }

        stage('Update Argo Rollout') {
            steps {
                sh '''
                    echo "================================"
                    echo "Updating Argo Rollout"
                    echo "================================"

                    kubectl argo rollouts set image \
                        ${ROLLOUT_NAME} \
                        nodejs-app=${IMAGE_NAME}:${IMAGE_TAG} \
                        -n ${NAMESPACE}

                    echo "Rollout image updated."

                    echo "Current rollout:"
                    kubectl argo rollouts get rollout \
                        ${ROLLOUT_NAME} \
                        -n ${NAMESPACE}
                '''
            }
        }

        stage('Check Deployment') {
            steps {
                sh '''
                    echo "================================"
                    echo "Deployment Check"
                    echo "================================"

                    echo "Rollout:"
                    kubectl argo rollouts get rollout \
                        ${ROLLOUT_NAME} \
                        -n ${NAMESPACE}

                    echo "Pods:"
                    kubectl get pods \
                        -n ${NAMESPACE} \
                        -l app=nodejs-rollout

                    echo "Services:"
                    kubectl get services \
                        -n ${NAMESPACE}

                    echo "Ingress:"
                    kubectl get ingress \
                        -n ${NAMESPACE}

                    echo "Application image:"
                    kubectl get rollout ${ROLLOUT_NAME} \
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

        success {
            echo "================================"
            echo "Project 2 CI/CD Pipeline Success"
            echo "================================"
            echo "Build: ${BUILD_NUMBER}"
            echo "Application Version: ${APP_VERSION}"
            echo "Docker Image: ${IMAGE_NAME}:${IMAGE_TAG}"
            echo "Argo Rollout: ${ROLLOUT_NAME}"
            echo "Namespace: ${NAMESPACE}"
        }

        failure {
            echo "Project 2 CI/CD Pipeline Failed."
            echo "Check the failed stage in the Jenkins console."
        }
    }
}

