import React, { useState, useEffect, FC, useRef } from "react"
import { Container, Row, Col, Form, Button } from "react-bootstrap"
import useStorage from '../util/useStorage'
import useStateCallback from '../util/useStateCallback'

export interface chemicalsType {
    chemicalList: Array<chemical>
}
export interface chemical {
    name: String,
    molarMass: String,
}
export const initialChemicals: chemicalsType = {
    chemicalList: [
        {
            name: "Na2HPO4",
            molarMass: "141.95897"
        },
        {
            name: "KH2PO4",
            molarMass: "136.08569"
        },
        {
            name: "NaCl",
            molarMass: "58.44300"
        },
        {
            name: "KCl",
            molarMass: "74.55150"
        }
    ]
}

const Chemical: FC = () => {
    //storage code
    const { getItem, setItem, removeItem } = useStorage()
    //local state for chemicals
    const [chemicals, setChemicals] = useStateCallback(initialChemicals)

    useEffect(() => {//check wheather have chemical in localstorage if no create with inital storage else just load it
        fetchChemicalFromStorage()
        window.addEventListener('storage',()=>{
            console.log('hear a storage event from chemical')
            ResetSelect()
            fetchChemicalFromStorage()
        })
        return () => {//when unload save chemical
            //saveChemical()
        }
    }, [])
    const fetchChemicalFromStorage = () => {
        if (getItem("chemicals")) {
            let chemicalFromStorage: chemicalsType = JSON.parse(getItem("chemicals"))
            setChemicals(chemicalFromStorage)//load state into it
            setSearchChemicalList(chemicalFromStorage.chemicalList.map(e => e.name))//load state to the search chemical list
        } else {
            setItem("chemicals", JSON.stringify(initialChemicals))//set item in local storage since initial item is already set independently, no need to follow by initialization code
        }
    }

    //method for saving
    const saveChemicalAfterMod = (chemi: chemicalsType) => {
        console.log(chemi)
        setItem("chemicals", JSON.stringify(chemi))
        fetchChemicalFromStorage()
    }
    const handleSubmit = () => {
        //check whether is blank
        let name = selectedChemical.name
        if (name === "") {
            alert("cannot be save, name could not be blank blank")
            return
        }
        //check whether is valid number
        let mm = selectedChemical.molarMass
        if (isNaN(parseFloat(mm)) || mm === "" || mm === "0") {
            alert("cannot be save, molar mass is not a number or 0 or blank")
            return
        }
        //check whether there is existing chemical of such name if yes, replace them//else add them and save them
        var newChemicalList: Array<chemical> = []
        if (chemicals.chemicalList.filter((e: chemical) => e.name === selectedChemical.name).length == 0) {
            newChemicalList = [...chemicals.chemicalList, selectedChemical]
        } else {
            newChemicalList = chemicals.chemicalList.map((e: chemical) => {
                if (e.name === selectedChemical.name) {
                    return selectedChemical
                } else {
                    return e
                }
            })
        }
        setChemicals({ chemicalList: newChemicalList }, (s: chemicalsType) => {
            console.log(s)
            alert("saved")
            saveChemicalAfterMod(s)
            handleDiscard()
        })
    }
    //handle discard changes and reset form to default
    const handleDiscard = () => {

        setSelectedChemical({ name: '', molarMass: '' })
        setEditable(false)
    }
    //handle delete chemical
    const handleDelete = () => {
        //check whether name is provided
        let name = selectedChemical.name
        if (name === "") {
            alert("to perform Delete, name must be provided")
            return
        }
        var newChemicalList: Array<chemical> = []
        newChemicalList = chemicals.chemicalList.filter((e: chemical) => e.name !== selectedChemical.name)
        setChemicals({ chemicalList: newChemicalList }, (s: chemicalsType) => {
            saveChemicalAfterMod(s)
            handleDiscard()
        })
    }
    //state for storing the chemicalsearch list 
    const [searchChemicalList, setSearchChemicalList] = useState(initialChemicals.chemicalList.map(e => e.name))
    //state for whether edit is locked
    const [editable, setEditable] = useState(false)
    //selected chemical
    const [selectedChemical, setSelectedChemical] = useState({ name: '', molarMass: '' })
    //reset the selection select
    const SelectionElement = useRef<HTMLSelectElement>(null)
    const ResetSelect = () => {
        if (SelectionElement.current) {
            SelectionElement.current.value = "Open this select menu"
        }
    }
    return (
        <Container>
            {/**searching */}
            <Row>
                <Col>
                    <Row>
                        <Col>
                            {/**search bar */}
                            <Form>
                                <Form.Group className="mb-3" >
                                    <Form.Label>Search Chemical Name</Form.Label>
                                    <Form.Control type="text" placeholder="" onChange={
                                        (evt) => {
                                            if (evt.target.value == "") {
                                                setSearchChemicalList(chemicals.chemicalList.map((e: chemical) => e.name))
                                            } else {
                                                setSearchChemicalList(chemicals.chemicalList.map((e: chemical) => e.name).filter((e: String) => e.includes(evt.target.value)))
                                            }
                                        }
                                    } />
                                </Form.Group>
                            </Form>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form>
                                <Form.Group className="mb-3" ></Form.Group>
                                <Form.Label>Select Chemical</Form.Label>
                                <Form.Control as="select" 
                                ref={SelectionElement}
                                onChange={(evt) => {
                                    let theSelectedChemicals = chemicals.chemicalList.filter((e: chemical) => e.name === evt.target.value)[0]
                                    if (!theSelectedChemicals) {
                                        setSelectedChemical({ name: "", molarMass: "" })
                                    } else {
                                        setSelectedChemical(theSelectedChemicals)
                                    }
                                }}>
                                    <option value="">Open this select menu</option>
                                    {searchChemicalList.map((e, i) => (<option key={i.toString() + e} value={e.valueOf()}>{e}</option>))}
                                </Form.Control>
                            </Form>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <hr />
            {/**edit */}
            <Row>
                <Col className="d-flex justify-content-end">
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                        <Form.Check
                            type="switch"
                            onChange={() => { setEditable(!editable) }}
                            checked={editable}
                        //disabled // apply if you want the switch disabled
                        />
                    </Form.Group>
                    <p className="ms-4">{editable ? "Edit enabled" : "Edit disabled"}</p>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form>
                        <Form.Group className="mb-3" >
                            <Form.Label>Name:</Form.Label>
                            <Form.Control type="text" value={selectedChemical.name} onChange={(evt) => {
                                setSelectedChemical({ name: evt.target.value, molarMass: selectedChemical.molarMass })
                            }}
                                disabled={!editable}
                            />
                            <Form.Text className="text-muted">
                                name cannot be blank
                            </Form.Text>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Molar mass g/mol</Form.Label>
                            <Form.Control type="text" value={selectedChemical.molarMass} onChange={(evt) => {
                                setSelectedChemical({ name: selectedChemical.name, molarMass: evt.target.value })
                            }}
                                disabled={!editable}
                            />
                            <Form.Text className="text-muted">
                                Molar mass cannot be blank or non number value
                            </Form.Text>
                        </Form.Group>
                    </Form>
                </Col>
            </Row>
            <Row>
                <Col className="d-flex flex-column align-content-stretch m-1">
                    <Button className="btn btn-primary" disabled={!editable} onClick={() => { handleSubmit() }}>
                        Save Changes
                    </Button>
                </Col>
                <Col className="d-flex flex-column align-content-stretch m-1">
                    <Button className="btn btn-danger" disabled={!editable} onClick={() => { handleDiscard() }}>
                        Discard Changes
                    </Button>
                </Col>
                <Col className="d-flex flex-column align-content-stretch m-1">
                    <Button className="btn btn-danger" disabled={!editable} onClick={() => { handleDelete() }}>
                        Delete Chemical
                    </Button>
                </Col>
            </Row>
        </Container>
    )
}
export default Chemical