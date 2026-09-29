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

        stage('Create Namespace') {
            steps {
                sh '''
                    kubectl apply -f k8s/namespace.yaml
                '''
            }
        }

        stage('Apply Kubernetes Configuration') {
            steps {
                sh '''
                    kubectl apply -f k8s/rollout-stable-service.yaml
                    kubectl apply -f k8s/rollout-canary-service.yaml
                    kubectl apply -f k8s/rollout-ingress.yaml
                    kubectl apply -f k8s/rollout.yaml
                    kubectl apply -f k8s/servicemonitor.yaml
                    kubectl apply -f k8s/analysis-template.yaml
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build \
                        --build-arg APP_VERSION=${APP_VERSION} \
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

        stage('Update Argo Rollout') {
            steps {
                sh '''
                    echo "Updating Argo Rollout..."

                    kubectl argo rollouts set image \
                        ${ROLLOUT_NAME} \
                        nodejs-app=${IMAGE_NAME}:${IMAGE_TAG} \
                        -n ${NAMESPACE}

                    echo "New image:"
                    echo "${IMAGE_NAME}:${IMAGE_TAG}"
                '''
            }
        }

        stage('Check Argo Rollout') {
            steps {
                sh '''
                    echo "======================================"
                    echo "Argo Rollout Status"
                    echo "======================================"

                    kubectl argo rollouts get rollout \
                        ${ROLLOUT_NAME} \
                        -n ${NAMESPACE}

                    echo "======================================"
                    echo "Analysis Runs"
                    echo "======================================"

                    kubectl get analysisruns \
                        -n ${NAMESPACE} \
                        -o wide || true
                '''
            }
        }

        stage('Check Kubernetes Resources') {
            steps {
                sh '''
                    echo "======================================"
                    echo "Deployments"
                    echo "======================================"

                    kubectl get deployments \
                        -n ${NAMESPACE}

                    echo "======================================"
                    echo "Pods"
                    echo "======================================"

                    kubectl get pods \
                        -n ${NAMESPACE}

                    echo "======================================"
                    echo "Services"
                    echo "======================================"

                    kubectl get services \
                        -n ${NAMESPACE}

                    echo "======================================"
                    echo "Ingress"
                    echo "======================================"

                    kubectl get ingress \
                        -n ${NAMESPACE}
                '''
            }
        }
    }

    post {

        success {
            echo """
            ======================================
            Project 2 CI/CD Pipeline Successful
            ======================================

            Build Number      : ${BUILD_NUMBER}
            Application Version: ${APP_VERSION}
            Docker Image      : ${IMAGE_NAME}:${IMAGE_TAG}
            Argo Rollout      : ${ROLLOUT_NAME}
            Namespace         : ${NAMESPACE}

            Progressive delivery is controlled by
            Argo Rollouts using Prometheus analysis.

            ======================================
            """
        }

        failure {
            echo """
            ======================================
            Project 2 CI/CD Pipeline Failed
            ======================================

            Check the Jenkins console output
            for the failed stage.

            ======================================
            """
        }

        always {
            sh 'docker logout || true'
        }
    }
}
