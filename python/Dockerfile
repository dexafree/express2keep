FROM python:2.7.15-alpine

RUN apk add --update --no-cache gcc g++ make alpine-sdk

WORKDIR /usr/src/app

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

ENV PYTHONUNBUFFERED=1

ADD https://github.com/Yelp/dumb-init/releases/download/v1.1.1/dumb-init_1.1.1_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

COPY . .

CMD ["dumb-init", "python", "main.py" ]
