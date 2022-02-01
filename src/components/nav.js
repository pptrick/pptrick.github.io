import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Container from 'react-bootstrap/Container'
import Link from 'next/link'
import styles from '../styles/Nav.module.css'
import {BsFillFileEarmarkTextFill, BsFillBookFill, BsFillLightbulbFill} from 'react-icons/bs';

export default function MyNav(){
    return (
        <Navbar bg="white" expand="lg" fixed="top">
            <Container fluid>
                <Navbar.Brand></Navbar.Brand>
                <Navbar.Toggle aria-controls="navbarScroll" />
                <Navbar.Collapse id="navbarScroll" className="justify-content-end">
                    <Nav>
                        <Nav.Item className="my-2"><Link href='/test'><a className={styles.navLink}><BsFillFileEarmarkTextFill/> Publication</a></Link></Nav.Item>
                        <Nav.Item className="my-2"><Link href='/test'><a className={styles.navLink}><BsFillBookFill/> Education</a></Link></Nav.Item>
                        <Nav.Item className="my-2"><Link href='/test'><a className={styles.navLink}><BsFillLightbulbFill/> Blog</a></Link></Nav.Item>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}