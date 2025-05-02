
# Install
sudo apt-get update
sudo apt-get install -y build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm libncurses5-dev libncursesw5-dev xz-utils tk-dev libffi-dev liblzma-dev openssl git
sudo apt install -y build-essential
sudo apt install -y openssh-server
sudo apt install -y htop lm-sensors wakeonlan net-tools
sudo apt install -y clang
sudo apt install -y openvpn
sudo apt install -y ifmetric

# Services
sudo cp config/etc/systemd/system/* /etc/systemd/system/
sudo systemctl enable sciveo-robot.service
sudo systemctl status sciveo-robot.timer
sudo systemctl restart sciveo-robot.service
sudo systemctl status sciveo-robot.timer

# Pyenvs
cd ~
mkdir develop

git clone https://github.com/pyenv/pyenv.git ~/.pyenv
cd ~/.pyenv && src/configure && make -C src

echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc

echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.profile
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.profile
echo 'eval "$(pyenv init -)"' >> ~/.profile
exec "$SHELL"

git clone https://github.com/pyenv/pyenv-virtualenv.git $(pyenv root)/plugins/pyenv-virtualenv
echo 'eval "$(pyenv virtualenv-init -)"' >> ~/.bashrc
exec "$SHELL"

pyenv install 3.9.10
pyenv virtualenv 3.9.10 robo-1
pyenv activate robo-1

