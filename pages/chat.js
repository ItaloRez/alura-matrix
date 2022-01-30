import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import React, { useState, useEffect, useRef } from 'react';
import appConfig from '../config.json';
import { createClient } from '@supabase/supabase-js';
import { Spinner, Overlay, Popover } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useRouter } from 'next/router';
import { FiUsers } from "react-icons/fi";
import { ButtonSendSticker } from '../src/components/ButtonSendSticker';

//senha supabase.io
//rIsZ8n#r#uZf*IJ#ScjSJ4wS

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzQ4ODcxNiwiZXhwIjoxOTU5MDY0NzE2fQ.RmEUu7IeRXYlT7cspeM6kzbPGtB_MFrUo-SUur4uz4c'
const SUPABASE_URL = 'https://rzgzkhcchmfqmdrydiyg.supabase.co'
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)


function escutaMensagensEmTempoReal(adicionaMensagem) {
    return supabaseClient
        .from('mensagens')
        .on('INSERT', (resp) => {
            adicionaMensagem(resp.new)
        })
        .subscribe()

}




export default function ChatPage() {

    useEffect(() => {

        supabaseClient
            .from('mensagens')
            .select('*')
            .order('id', { ascending: false })
            .then(({ data }) => {
                setListaMsg(data)
                setCarregando(false)
            })
        //Quero reusar um valor de referencia (objeto/array)
        //passar uma função pro setState
        escutaMensagensEmTempoReal((novaMensagem) => {
            setListaMsg((valorAtual) => {
                return [
                    novaMensagem,
                    ...valorAtual
                ]
            })
        })
    }, [])

    const [mensagem, setMensagem] = useState('');
    const [listaMsg, setListaMsg] = useState([

    ]);
    const [carregando, setCarregando] = useState(true);
    const router = useRouter()
    const usuariologado = router.query.username



    function handleNovaMensagem(novaMensagem) {
        const mensagem = {
            texto: novaMensagem,
            de: usuariologado,
        }

        supabaseClient
            .from('mensagens')
            .insert([mensagem])
            .then(({ data }) => { })


        setMensagem('')
    }

    return (
        <Box

            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: appConfig.theme.colors.primary[500],
                backgroundImage: `url(https://virtualbackgrounds.site/wp-content/uploads/2020/08/the-matrix-digital-rain.jpg)`,
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    backgroundColor: appConfig.theme.colors.neutrals[700],
                    height: '100%',
                    maxWidth: '95%',
                    maxHeight: '95vh',
                    padding: '32px',
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        backgroundColor: appConfig.theme.colors.neutrals[600],
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}
                >
                    {carregando
                        ? <div style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                        : <MessageList mensagens={listaMsg} setMsg={setListaMsg} />
                    }

                    <Box
                        as="form"
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <TextField
                            value={mensagem}
                            onChange={(e) => setMensagem(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault()
                                    handleNovaMensagem(mensagem)
                                }
                            }}
                            placeholder="Insira sua mensagem aqui..."
                            type="textarea"
                            styleSheet={{
                                width: '100%',
                                border: '0',
                                resize: 'none',
                                borderRadius: '5px',
                                padding: '6px 8px',
                                backgroundColor: appConfig.theme.colors.neutrals[800],
                                marginRight: '12px',
                                color: appConfig.theme.colors.neutrals[200],
                            }}
                        />
                        <ButtonSendSticker
                            onStickerClick={(sticker) => handleNovaMensagem(`:sticker: ${sticker}`)}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

function Header() {
    return (
        <>
            <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                <Text variant='heading5'>
                    Chat
                </Text>
                <Button
                    variant='tertiary'
                    colorVariant='neutral'
                    label='Logout'
                    href="/"
                />
            </Box>
        </>
    )
}

function MessageList({ mensagens, setMsg }) {

    const [show, setShow] = useState(false);
    const [showIndex, setShowIndex] = useState()
    const [dataUser, setDataUser] = useState([])
    const [target, setTarget] = useState(null)

    function handleClick(e, mensagem, index) {
        setShow(true)
        setTarget(e.target)
        setShowIndex(index)
        fetch(`https://api.github.com/users/${mensagem.de}`)
            .then((resp) => resp.json())
            .then((data) => setDataUser(data))
    }

    return (
        <Box
            tag="ul"
            styleSheet={{
                overflow: 'scroll',
                display: 'flex',
                flexDirection: 'column-reverse',
                flex: 1,
                color: appConfig.theme.colors.neutrals["000"],
                marginBottom: '16px',

            }}
        >



            {
                mensagens.map((mensagem, index) => {
                    return (
                        <>
                            <Text
                                key={mensagem.id}
                                tag="li"
                                styleSheet={{
                                    borderRadius: '5px',
                                    padding: '6px',
                                    marginBottom: '12px',
                                    hover: {
                                        backgroundColor: appConfig.theme.colors.neutrals[700],
                                    },

                                }}
                                onMouseLeave={() => setShow(false)}
                            >
                                <Box
                                    styleSheet={{
                                        marginBottom: '8px',
                                    }}
                                >
                                    {
                                        showIndex == index &&

                                        <Overlay
                                            show={show}
                                            target={target}
                                            placement="right"
                                            containerPadding={20}
                                            className="bg-primary"
                                        >
                                            <Popover id="popover-contained" style={{ maxWidth: '100%' }}>
                                                <Popover.Header as="h3">{mensagem.de}</Popover.Header>

                                                <Popover.Body className="d-flex flex-row" >
                                                    <Image
                                                        styleSheet={{
                                                            width: '90px',
                                                            height: '90px',
                                                            borderRadius: '50%',
                                                            display: 'inline-block',
                                                            marginRight: '25px',
                                                        }}
                                                        src={`https://github.com/${mensagem.de}.png`}
                                                    />
                                                    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
                                                        <Text styleSheet={{ fontWeight: 'bold' }}>{mensagem.de}</Text>
                                                        <Text>
                                                            <a
                                                                href={dataUser.html_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{ textDecoration: 'none', color: 'black' }}
                                                            >
                                                                {dataUser.html_url}
                                                            </a>
                                                        </Text>
                                                        <Text style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <FiUsers />{dataUser.followers} followers · {dataUser.following} following
                                                        </Text>
                                                    </div>
                                                </Popover.Body>

                                            </Popover>
                                        </Overlay>
                                    }

                                    <Image
                                        styleSheet={{
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '50%',
                                            display: 'inline-block',
                                            marginRight: '8px',
                                        }}
                                        src={`https://github.com/${mensagem.de}.png`}
                                        onMouseEnter={e => handleClick(e, mensagem, index)}
                                    />


                                    <Text tag="strong">
                                        {mensagem.de}
                                    </Text>
                                    <Text
                                        styleSheet={{
                                            fontSize: '10px',
                                            marginLeft: '8px',
                                            color: appConfig.theme.colors.neutrals[300],
                                        }}
                                        tag="span"
                                    >
                                        {(new Date().toLocaleDateString())}
                                    </Text>
                                </Box>

                                <Box styleSheet={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                }}>
                                    {mensagem.texto.startsWith(':sticker:')
                                        ? <Image src={mensagem.texto.replace(':sticker:', '')} />
                                        : mensagem.texto.toString()
                                    }

                                    <Button label="❌" styleSheet={{
                                        color: 'black',
                                        backgroundColor: 'transparent',
                                        hover: {
                                            backgroundColor: 'rgba(0,0,0,0.1)'
                                        }
                                    }}
                                        onClick={() => {
                                            var list = [...mensagens]
                                            list.splice(index, 1)
                                            setMsg(list)
                                        }}
                                    />

                                </Box>
                            </Text>
                        </>
                    )
                })
            }
        </Box>
    )
}