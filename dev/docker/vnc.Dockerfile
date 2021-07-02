FROM node:16

WORKDIR /novnc
RUN git clone --branch v1.2.0 https://github.com/novnc/noVNC.git .
RUN git clone https://github.com/novnc/websockify ./utils/websockify
RUN sed -i 's/$(hostname):${PORT}\/vnc.html?host=$(hostname)&port=${PORT}/host.docker.internal:${PORT}\/vnc.html/g' ./utils/launch.sh

CMD utils/launch.sh --vnc selenium:5900


