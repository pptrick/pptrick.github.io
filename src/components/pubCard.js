import styles from '../styles/publication.module.css'
import {Grid, Item} from '@mui/material/'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import {BsFillPuzzleFill, BsFillFileEarmarkPdfFill, BsFillPlayCircleFill} from 'react-icons/bs';

function PubLink({Icon, name, children}){
    if(children){
        return (
            <a className={styles.pubLink} href={children}>
                [ <Icon/> {name} ]
            </a>
        )
    }
    else{
        return null //not displayed if the item is none
    }
}

// TODO: add links for each author

export default function PubCard(pubData){
    const info = pubData.info; //Information ([dict]) for each publication
    return (
        <ul className={styles.pubContainer}>
            <Grid container spacing={2}>
                <Grid item xs={4}> {/*An image set on left*/}
                    <div className={styles.pubImg}>
                    <Zoom>
                        <img
                        src={info.img_path}
                        className={styles.pubImg}
                        alt={info.id}
                        />
                    </Zoom>
                    </div>
                </Grid>
                <Grid item xs={8}> {/*Content set on right*/}
                    <div className={styles.pubTitle}>{info.title}</div>
                    <div className={styles.pubAuthor}>{info.author}</div>
                    <div className={styles.pubConf}>{info.conference}</div>
                    <div className={styles.pubAbstract}>{info.content}</div>
                    {/* <div>{date}</div> */}
                    <PubLink Icon={BsFillPuzzleFill} name={"Project Page"}>{info.projectPage}</PubLink>
                    <PubLink Icon={BsFillFileEarmarkPdfFill} name={"Paper"}>{info.paper}</PubLink>
                    <PubLink Icon={BsFillPlayCircleFill} name={"Video"}>{info.video}</PubLink>
                </Grid>
            </Grid>
        </ul>
    )
}