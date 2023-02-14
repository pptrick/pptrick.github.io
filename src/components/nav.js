import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Container from 'react-bootstrap/Container'
import Link from 'next/link'
import styles from '../styles/Nav.module.css'
import {BsFillFileEarmarkTextFill, BsFillBookFill, BsFillLightbulbFill, BsFillHouseFill} from 'react-icons/bs';

export default function MyNav(){
    return (
        <Navbar bg="white" expand="lg" fixed="top">
            <Container fluid>
                <Navbar.Brand><Link href='/'><a className={styles.navLink}><BsFillHouseFill/> Home</a></Link></Navbar.Brand>
                <Navbar.Toggle aria-controls="navbarScroll" />
                <Navbar.Collapse id="navbarScroll" className="justify-content-end">
                    <Nav>
                        <Nav.Item className="my-2"><Link href='/publication'><a className={styles.navLink}><BsFillFileEarmarkTextFill/> Publication</a></Link></Nav.Item>
                        <Nav.Item className="my-2"><Link href='/education'><a className={styles.navLink}><BsFillBookFill/> Education</a></Link></Nav.Item>
                        <Nav.Item className="my-2"><Link href='/project'><a className={styles.navLink}><BsFillLightbulbFill/> Project</a></Link></Nav.Item>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}