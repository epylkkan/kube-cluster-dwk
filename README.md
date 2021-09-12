Commands:

k3d cluster delete
k3d cluster create --port '8082:30080@agent[0]' -p 8081:80@loadbalancer --agents 2

kubectl create namespace todo
kubectl get nodes --output wide
# kubectl create secret generic todopw --from-file=/usr/src/app/todopw -n todo // not used

flux bootstrap github --owner=epylkkan --repository=kube-cluster-dwk --personal --private=false
git clone https://github.com/epylkkan/kube-cluster-dwk



START NATS, POSTGRE AND INGRESS (no own code)

./4.07-4.08
kubectl create configmap nats-config --from-file /etc/nats-config/nats.conf -n todo // copied also to ./4.06/nats/conf -directory
kubectl apply -k .



SEALED SECRETS

Steps: https://aws.amazon.com/blogs/opensource/managing-secrets-deployment-in-kubernetes-using-sealed-secrets: 

wget https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.10.0/kubeseal-linux-amd64 -O kubeseal
sudo install -m 755 kubeseal /usr/local/bin/kubeseal

wget https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.12.1/controller.yaml
kubectl apply -f controller.yaml
kubectl get po -n kube-system
k logs sealed-secrets-controller-5cbc6dc7d8-jsxqr -n kube-system
kubectl get secret -n kube-system -l sealedsecrets.bitnami.com/sealed-secrets-key -o yaml

1) create sealed secret for posgre

kubectl kustomize . > secret.yaml
kubeseal --format=yaml < secret.yaml > sealed-secret.yaml
# kubeseal --format=yaml --cert=public-key-cert.pem < secret.yaml > sealed-secret.yaml // not needed
# kubectl apply -f sealed-secret.yaml // not used

1) create sealed secret for telegram

kubectl kustomize . > secret.yaml
kubeseal --format=yaml < secret.yaml > sealed-secret.yaml
# kubeseal --format=yaml --cert=public-key-cert.pem < secret.yaml > sealed-secret.yaml // not needed
# kubectl apply -f sealed-secret.yaml // not used


GIT 

git add .
git commit -m "...update"
git push origin main

