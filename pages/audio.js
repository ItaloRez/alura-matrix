import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { AiFillAudio } from "react-icons/ai";
import 'bootstrap/dist/css/bootstrap.min.css';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzQ4ODcxNiwiZXhwIjoxOTU5MDY0NzE2fQ.RmEUu7IeRXYlT7cspeM6kzbPGtB_MFrUo-SUur4uz4c'
const SUPABASE_URL = 'https://rzgzkhcchmfqmdrydiyg.supabase.co'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default function pages(props) {

    useEffect(() => {
        //listaAudios()
        //getMedia()
        start()
    }, [])

    const [lista, setLista] = useState([])
    const [lista2, setLista2] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [carregando2, setCarregando2] = useState(true)
    const [estadoBotao, setEstadoBotao] = useState(true)


    function sairSessao() {
        supabase.auth.signOut()
    }

    function getSessao() {
        console.log(supabase.auth.session())
        console.log(supabase.auth.user())
    }

    function uploadMusic(audioBlob) {
        const nome = `audio_${getRandomInt(0, 1500)}_${audioBlob.size}`
        supabase
            .storage
            .from('audios')
            .upload(nome, audioBlob)
            .then(resp => {
                props.onAudioSend(nome)
            })
            .catch((err) => console.log(err))

    }

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function downloadMusic(list) {
        var listurl = [];
        var listPromises = [];
        list.map(({ name }) => {
            listPromises.push(
                supabase
                    .storage
                    .from('audios')
                    .download(name)
                    .then((data) => {
                        const audioUrl = URL.createObjectURL(data.data)
                        listurl.push(audioUrl)
                    })
            )
        })
        Promise.all(listPromises)
            .then(() => {
                setLista2(listurl)
                setCarregando2(false)
            })
        //return list
        // .then((data) => {

        //     const audioUrl = URL.createObjectURL(data.data);
        //     const audio = new Audio(audioUrl);
        //     audio.setAttribute("controls", "enabled")

        // })
        // .catch((err) => console.log(err))

        // const audioUrl = URL.createObjectURL(data.data);
        // const audio = new Audio(audioUrl);
        // audio.setAttribute("controls", "enabled")
        // return audio

    }

    function tocaMusica(audio) {
        const audioUrl = URL.createObjectURL(audio);
        const audiou = new Audio(audioUrl);
        audiou.play();
    }

    function createUser() {
        supabase
            .auth
            .signIn({
                email: 'italoeji@hotmail.com',
                password: '123456'
            })
            .then((data) => console.log(data))
            .catch((err) => console.log(err))
    }

    function listaAudios() {
        supabase
            .storage
            .from('audios')
            .list('', {
                limit: 100,
                offset: 0,
                sortBy: { column: 'created_at', order: 'asc' },
            })
            .then(data => {
                //setLista(data.data)
                //setCarregando(false)
                //downloadMusic(data.data)
                console.log(data)
            })
            .catch((err) => console.log(err))
    }

    function getMedia() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();
                console.log(mediaRecorder.state)

                const audioChunks = [];

                mediaRecorder.addEventListener("dataavailable", event => {
                    audioChunks.push(event.data);
                });

                mediaRecorder.addEventListener("stop", () => {
                    //console.log('pauso')
                    const audioBlob = new Blob(audioChunks);
                    const audioUrl = URL.createObjectURL(audioBlob);
                    const audio = new Audio(audioUrl);
                    //setMusic(audioBlob)
                    //uploadMusic(audioBlob)
                    //audio.play();
                });

                let stop = document.getElementById('btnStop')

                //mediaRecorder.onerror(err=> console.log('errozao: ' + err))
                mediaRecorder.addEventListener('state', (e) => console.log(e))

                stop.addEventListener('click', () => {

                    setEstadoBotao(true)
                    if (mediaRecorder.state != 'inactive') mediaRecorder.stop()
                    stream
                        .getTracks()
                        .forEach(track => track.stop())
                    console.log(mediaRecorder.state)

                })



            })
    }

    const [teste, setTeste] = useState('')

    const recordAudio = () => {
        return new Promise(resolve => {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    const mediaRecorder = new MediaRecorder(stream);
                    const audioChunks = [];

                    mediaRecorder.addEventListener("dataavailable", event => {
                        audioChunks.push(event.data);
                    });

                    const start = () => {
                        mediaRecorder.start();
                    };

                    const stop = () => {
                        return new Promise(resolve => {
                            mediaRecorder.addEventListener("stop", () => {
                                const audioBlob = new Blob(audioChunks);
                                const audioUrl = URL.createObjectURL(audioBlob);
                                const audio = new Audio(audioUrl);
                                const play = () => {
                                    audio.play();
                                };

                                resolve({ audioBlob, audioUrl, play });
                            });

                            mediaRecorder.stop();
                            audioChunks.shift();

                        });
                    };

                    resolve({ start, stop });
                });
        });
    };

    async function start() {
        const recorder = await recordAudio()

        botaoStart.current.addEventListener('click', () => recorder.start())
        botaoPause.current.addEventListener('click', () => {
            recorder.stop()
                .then(resp => {
                    uploadMusic(resp.audioBlob)
                })
        })
    }

    const botaoPause = useRef()
    const botaoStart = useRef()

    function mudaBotao() {
        setEstadoBotao((estadoatual) => !estadoatual)
    }


    return (
        <div>
            <button
                ref={botaoStart}
                className="btn btn-primary rounded-circle"
                style={{ height: '50px', width: '50px', marginBottom: '8px', marginLeft: '10px',
                display: estadoBotao ? null : 'none' }}
                onClick={mudaBotao}
                type="button"
            >
                <AiFillAudio className='mx-auto my-auto' style={{ fontSize: '20px' }} />
            </button>
            <button
               ref={botaoPause}
                className="btn btn-danger rounded-circle"
                style={{ height: '50px', width: '50px', marginBottom: '8px', marginLeft: '10px', 
                display: estadoBotao ? 'none' : null }}
                type="button"
                onClick={mudaBotao}
            >
                <AiFillAudio className='mx-auto my-auto' style={{ fontSize: '20px' }} />
            </button>
        </div>
    )

}



