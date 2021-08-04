import React, { useState, useEffect, FC,useRef } from "react"
import useStorage from '../util/useStorage'
import { solution, solutions, initialsolutions, chemicalConc } from './Solution'
import useStateCallback from "../util/useStateCallback"
import { Container, Row, Col, Form,Card } from "react-bootstrap"
//import {chemical} from './Chemical'

type volumeUnit = "L" | "mL" | "uL"

const Recipe: FC = () => {
    const { getItem, setItem, removeItem } = useStorage()
    //local state for solutions
    const [solutions, setsolutions] = useStateCallback(initialsolutions)
    //state for storing the solutionsearch list 
    const [searchsolutionList, setSearchsolutionList] = useState(initialsolutions.solutionList.map(e => e.name))
    //selectedSolution
    const [selectedsolution, setSelectedsolution] = useState<solution>({
        name: "",
        solvent: "",
        remarks: "",
        soluteArray: []
    })
    //volume state
    const [volume, setVolume] = useState<number>(500)
    //volume unit
    const [unit, setUnit] = useState<volumeUnit>("mL")
    useEffect(() => {
        //fetch solution from storage
        fetchsolutionFromStorage()
        window.addEventListener('storage',()=>{
            console.log('hear a storage event from recipe')
            fetchsolutionFromStorage()
            ResetSelect()
            setSelectedsolution({
                name: "",
                solvent: "",
                remarks: "",
                soluteArray: []
            })
        })
        return () => {

        }
    }, [])
    const fetchsolutionFromStorage = () => {
        if (getItem("solutions")) {
            let solutionFromStorage: solutions = JSON.parse(getItem("solutions"))
            setsolutions(solutionFromStorage)//load state into it
            setSearchsolutionList(solutionFromStorage.solutionList.map(e => e.name))//load state to the search solution list
        } else {
            setItem("solutions", JSON.stringify(initialsolutions))//set item in local storage since initial item is already set independently, no need to follow by initialization code
        }
    }
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
                                    <Form.Label>Search solution Name</Form.Label>
                                    <Form.Control type="text" placeholder="" onChange={
                                        (evt) => {
                                            if (evt.target.value == "") {
                                                setSearchsolutionList(solutions.solutionList.map((e: solution) => e.name))
                                            } else {
                                                setSearchsolutionList(solutions.solutionList.map((e: solution) => e.name).filter((e: String) => e.includes(evt.target.value)))
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
                                <Form.Label>Select solution</Form.Label>
                                <Form.Control as="select" ref={SelectionElement} onChange={(evt) => {
                                    let theSelectedSolutions = solutions.solutionList.filter((e: solution) => e.name === evt.target.value)[0]
                                    if (!theSelectedSolutions) {
                                        setSelectedsolution({
                                            name: "",
                                            solvent: "",
                                            remarks: "",
                                            soluteArray: []
                                        })
                                    } else {
                                        setSelectedsolution(theSelectedSolutions)
                                    }
                                }}>
                                    <option>Open this select menu</option>
                                    {searchsolutionList.map((e, i) => (<option key={i.toString() + e} value={e.valueOf()}>{e}</option>))}
                                </Form.Control>
                            </Form>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <hr />
            <Row>
                <Col md={6}>
                    <h4>{selectedsolution.name}</h4>
                </Col>
                <Col xs={6} md={3}>
                    <Form>
                        <Form.Group className="mb-3" >
                            <Form.Label>Volume</Form.Label>
                            <Form.Control type="text" placeholder="500"
                                disabled={selectedsolution.name === ""}
                                onChange={
                                    (evt) => {
                                        console.log(evt.target.value)
                                        if (evt.target.value == "") {
                                            setVolume(500)
                                        } else {
                                            if (isNaN(parseInt(evt.target.value))) {
                                                alert("volume should be an Integer")
                                                setVolume(500)
                                            } else {
                                                setVolume(parseInt(evt.target.value))
                                            }
                                        }
                                    }
                                } />
                        </Form.Group>
                    </Form>
                </Col>
                <Col xs={6} md={3}>
                    <Form>
                        <Form.Group className="mb-3" >
                            <Form.Label>Volume</Form.Label>
                            <Form.Control as="select"
                                disabled={selectedsolution.name === ""}
                                onChange={(evt) => {
                                    setUnit(evt.target.value as volumeUnit)
                                }}>
                                <option value="L">L</option>
                                <option selected value="mL">mL</option>
                                <option value="uL">uL</option>
                            </Form.Control>
                        </Form.Group>
                    </Form>
                </Col>
            </Row>
            <Card className="p-3">
                <Row>
                    <Col>
                        <h6>Solvent:</h6>
                        <p>
                            {selectedsolution.solvent}
                        </p>
                    </Col>
                    <Col>
                        <h6>Remarks:</h6>
                        <p>
                            {selectedsolution.remarks}
                        </p>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col style={{ maxHeight: '40vh', overflowY: 'auto' }}>
                        {selectedsolution.soluteArray.map(e => (
                            <RecipeItem key={e.toString() + "recipe"} solute={e} unit={unit} volume={volume} />
                        ))}
                    </Col>
                </Row>
            </Card>
        </Container>
    )
}
export default Recipe
interface recipeItemProps {
    solute: chemicalConc
    unit: volumeUnit
    volume: number
}
const RecipeItem = ({ solute, unit, volume }: recipeItemProps) => {
    const [localUnit, setLocalUnit] = useState<volumeUnit>(unit)
    const [localVolume, setLocalVolume] = useState<number>(volume)
    const [localSolute,setLocalSolute] = useState<chemicalConc>(solute)
    useEffect(() => {
        setLocalUnit(unit)
        setLocalVolume(volume)
        setLocalSolute(solute)
    }, [unit, volume,solute])
    const getMassInG = (): number => {
        var volume = localVolume//toL
        if (localUnit === "L") {
            volume = volume
        } else if (localUnit === "mL") {
            volume = volume / 1000
        } else if (localUnit === "uL") {
            volume = volume / 1000 / 1000
        }
        var conc = parseFloat(localSolute.concentration.valueOf())//toM
        if (localSolute.unit === "M") {
            conc = conc
        } else if (localSolute.unit === "mM") {
            conc = conc / 1000
        } else if (localSolute.unit === "uM") {
            conc = conc / 1000 / 1000
        } else if (localSolute.unit === "nM") {
            conc = conc / 1000 / 1000 / 1000
        } else if (localSolute.unit === "pM") {
            conc = conc / 1000 / 1000 / 1000 / 1000
        }
        return volume * conc * parseFloat(localSolute.solute.molarMass.valueOf())
    }
    return (
        <Row className="m-1">
            <Col>{localSolute.solute.name}</Col>
            <Col className="d-flex justify-content-end">{localSolute.solute.molarMass + " g/mol"}</Col>
            <Col className="d-flex justify-content-end">{localSolute.concentration + localSolute.unit}</Col>
            <Col className="d-flex justify-content-end">{
                getMassInG().toString() + " g"
            }</Col>
        </Row>
    )
}