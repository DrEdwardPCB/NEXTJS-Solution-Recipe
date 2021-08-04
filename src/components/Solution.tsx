import React, { useState, useEffect, FC, useRef, useCallback } from "react"
import { Container, Row, Col, Form, Button } from "react-bootstrap"
import useStorage from '../util/useStorage'
import useStateCallback from '../util/useStateCallback'
import { chemical, initialChemicals, chemicalsType } from './Chemical'
export interface solutions {
    solutionList: Array<solution>
}
export interface chemicalConc {
    unit: concentrationUnit
    concentration: String
    solute: chemical
}
export type concentrationUnit = 'pM' | 'nM' | 'uM' | 'mM' | 'M'
export interface solution {
    name: String,
    solvent: String,
    remarks: String,
    soluteArray: Array<chemicalConc>
}
export const initialsolutions: solutions = {
    solutionList: [
        {
            name: "PBS",
            solvent: "water",
            soluteArray: [
                {
                    unit: 'M',
                    concentration: '0.01',
                    solute: {
                        name: "Na2HPO4",
                        molarMass: "141.95897"
                    }
                },
                {
                    unit: 'M',
                    concentration: '0.0018',
                    solute: {
                        name: "KH2PO4",
                        molarMass: "136.08569"
                    }
                },
                {
                    unit: 'M',
                    concentration: '0.1370',
                    solute: {
                        name: "NaCl",
                        molarMass: "58.44300"
                    }
                },
                {
                    unit: 'M',
                    concentration: '0.0027',
                    solute: {
                        name: "KCl",
                        molarMass: "74.55150"
                    }
                },
            ],
            remarks: "pH 7.4"
        },
    ]
}
interface MyDict {
    [name: string]: string
}

const Solution: FC = () => {
    //storage code
    const { getItem, setItem, removeItem } = useStorage()
    //local state for solutions
    const [solutions, setsolutions] = useStateCallback(initialsolutions)
    const [chemicals, setChemicals] = useStateCallback(initialChemicals)
    useEffect(() => {//check wheather have solution in localstorage if no create with inital storage else just load it
        fetchsolutionFromStorage()
        fetchChemicalFromStorage()
        window.addEventListener('storage', () => {
            //updated state are not visible here, only inital state are available
            console.log('hear a storage event from solution')
            fetchsolutionFromStorage()
            fetchChemicalFromStorage()
            relatingChemicalAndSolution()
            ResetSelect()
            setSelectedsolution({
                name: "",
                solvent: "",
                remarks: "",
                soluteArray: []
            })
        })
        return () => {//when unload save solution
            //savesolution()
        }
    }, [])

    const relatingChemicalAndSolution = () => {
        //for each solution check their chemical see whether it could find 
        //if found name match but molar mass wrong, update the solution
        //if found no name match, discard the solution
        if (getItem("chemicals") && getItem('solutions')) {
            let chemicalFromStorage: chemicalsType = JSON.parse(getItem("chemicals"))
            let solutionFromStorage: solutions = JSON.parse(getItem("solutions"))
            let chemicalFromStorageDict = chemicalFromStorage.chemicalList.reduce<Record<string, string>>((accum, curr) => {
                accum[curr.name.valueOf()] = curr.molarMass.valueOf()
                return accum
            }, {})
            const solutionListAfterRelation=solutionFromStorage.solutionList.filter((e: solution) => {
                var discard = false
                e.soluteArray.forEach((f: chemicalConc) => {
                    let chemicalArray = chemicalFromStorage.chemicalList.map((g: chemical) => g.name)
                    if (!chemicalArray.includes(f.solute.name)) {
                        discard = true
                    }
                })
                return !discard
            }).map((e: solution) => {
                return {
                    ...e,
                    soluteArray:e.soluteArray.map((f: chemicalConc) => {
                        if (f.solute.molarMass==chemicalFromStorageDict[f.solute.name.valueOf()]){
                            return f
                        }else{
                            return{...f,solute:{name:f.solute.name,molarMass:chemicalFromStorageDict[f.solute.name.valueOf()]}}
                        }
                    })
                }
            })

            setItem('solutions',JSON.stringify({solutionList:solutionListAfterRelation}))
        }
    }
    const fetchChemicalFromStorage = () => {

        if (getItem("chemicals")) {
            let chemicalFromStorage: chemicalsType = JSON.parse(getItem("chemicals"))
            setChemicals(chemicalFromStorage)//load state into it

        } else {
            //console.log('resetting')
            setItem("chemicals", JSON.stringify(initialChemicals))//set item in local storage since initial item is already set independently, no need to follow by initialization code
        }
    }

    const fetchsolutionFromStorage = () => {
        if (getItem("solutions")) {
            let solutionFromStorage: solutions = JSON.parse(getItem("solutions"))
            setsolutions(solutionFromStorage)//load state into it
            setSearchsolutionList(solutionFromStorage.solutionList.map(e => e.name))//load state to the search solution list
        } else {
            setItem("solutions", JSON.stringify(initialsolutions))//set item in local storage since initial item is already set independently, no need to follow by initialization code
        }
    }

    //method for saving
    const savesolutionAfterMod = (solu: solutions) => {
        //console.log(solu)
        setItem("solutions", JSON.stringify(solu))
        fetchsolutionFromStorage()
    }
    const handleSubmit = () => {

        //check if name blank
        if (selectedsolution.name === "") {
            alert("cannot be save, name could not be blank blank")
            return
        }
        if (selectedsolution.solvent === "") {
            alert("cannot be save, solvent could not be blank blank")
            return
        }
        //check whether concentration is valid number
        if (selectedsolution.soluteArray.filter(e => isNaN(parseFloat(e.concentration.valueOf()))).length > 0) {
            alert("cannot be save, concentration must be a number")
            return
        }
        //check whether there is existing solution of such name if yes, replace them//else add them and save them
        var newsolutionList: Array<solution> = []
        if (solutions.solutionList.filter((e: solution) => e.name === selectedsolution.name).length == 0) {
            newsolutionList = [...solutions.solutionList, selectedsolution]
        } else {
            newsolutionList = solutions.solutionList.map((e: solution) => {
                if (e.name === selectedsolution.name) {
                    return selectedsolution
                } else {
                    return e
                }
            })
        }
        setsolutions({ solutionList: newsolutionList }, (s: solutions) => {
            //console.log(s)
            alert("saved")
            savesolutionAfterMod(s)
            handleDiscard()
        })
    }
    //handle discard changes and reset form to default
    const handleDiscard = () => {

        setSelectedsolution({
            name: "",
            solvent: "",
            remarks: "",
            soluteArray: []
        })
        setEditable(false)
        ResetSelect()
    }
    //handle delete solution
    const handleDelete = () => {
        //check whether name is provided
        let name = selectedsolution.name
        if (name === "") {
            alert("to perform Delete, name must be provided")
            return
        }
        var newsolutionList: Array<solution> = []
        newsolutionList = solutions.solutionList.filter((e: solution) => e.name !== selectedsolution.name)
        setsolutions({ solutionList: newsolutionList }, (s: solutions) => {
            savesolutionAfterMod(s)
            handleDiscard()
        })
    }
    //state for storing the solutionsearch list 
    const [searchsolutionList, setSearchsolutionList] = useState(initialsolutions.solutionList.map(e => e.name))
    //state for whether edit is locked
    const [editable, setEditable] = useState(false)
    //selected solution
    const [selectedsolution, setSelectedsolution] = useState<solution>({
        name: "",
        solvent: "",
        remarks: "",
        soluteArray: []
    })

    {/**
        handling the 2 item for select chemicals and update
    */}
    const updateHandlerForChemicalList = (sollist: Array<chemicalConc>) => {
        //update the soluteList of selectedsolution
        setSelectedsolution({ ...selectedsolution, soluteArray: sollist })
    }
    const updateHandlerForRecipeList = (sollist: Array<chemicalConc>) => {
        //update the soluteList of selectedsolution
        setSelectedsolution({ ...selectedsolution, soluteArray: sollist })
    }
    {/**
        end handling the 2 item for select chemicals and update
    */}
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
                                <Form.Control as="select"
                                    ref={SelectionElement}
                                    onChange={(evt) => {
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
                            <Form.Control type="text" value={selectedsolution.name.valueOf()} onChange={(evt) => {
                                setSelectedsolution({ ...selectedsolution, name: evt.target.value })
                            }}
                                disabled={!editable}
                            />
                            <Form.Text className="text-muted">
                                name cannot be blank
                            </Form.Text>
                        </Form.Group>
                    </Form>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form>
                        <Form.Group className="mb-3" >
                            <Form.Label>Solvent:</Form.Label>
                            <Form.Control type="text" value={selectedsolution.solvent.valueOf()} onChange={(evt) => {
                                setSelectedsolution({ ...selectedsolution, solvent: evt.target.value })
                            }}
                                disabled={!editable}
                            />
                            <Form.Text className="text-muted">
                                solvent cannot be blank
                            </Form.Text>
                        </Form.Group>
                    </Form>
                </Col>
            </Row>
            {/**
 * start adding logic for solution specific things
 */}
            <Row>
                <Col lg={5}>
                    <ChemicalList chemicalList={chemicals} selectedSolution={selectedsolution} updateHandler={updateHandlerForChemicalList} editable={editable} />
                </Col>
                <Col lg={7}>
                    <RecipeList selectedSolution={selectedsolution} updateHandler={updateHandlerForRecipeList} editable={editable} />
                </Col>
            </Row>
            {/**
 * start adding logic for solution specific things
 */}
            <Row>
                <Col>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Remarks</Form.Label>
                            <Form.Control type="text" value={selectedsolution.remarks.valueOf()} onChange={(evt) => {
                                setSelectedsolution({ ...selectedsolution, remarks: evt.target.value })
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
                        Delete solution
                    </Button>
                </Col>
            </Row>
        </Container>
    )
}
interface ChemicalListProps {
    chemicalList: chemicalsType
    selectedSolution: solution
    updateHandler: Function
    editable: Boolean
}


const ChemicalList = ({ chemicalList, selectedSolution, updateHandler, editable }: ChemicalListProps) => {
    //local copy
    const [localChemicalList, setLocalChemicalList] = useState(chemicalList.chemicalList)
    const [localSelectedSolution, setLocalSelectedSolution] = useStateCallback(selectedSolution.soluteArray)
    const [localEditable, setLocalEditable] = useState(editable)
    //relating local state when props are changed
    useEffect(() => {
        setLocalChemicalList(chemicalList.chemicalList)
        setLocalSelectedSolution(selectedSolution.soluteArray)
        setLocalEditable(editable)
    }, [chemicalList, selectedSolution, editable])
    //renderring function of chemicalListItem
    const renderList = () => {
        //console.log(localSelectedSolution)
        let chemicalsInSelected = localSelectedSolution.map((e: chemicalConc) => {
            //console.log(e)
            return e.solute.name
        })
        return localChemicalList.filter((e: chemical) => !chemicalsInSelected.includes(e.name)).map((e: chemical, i) => (
            <ChemicalListItem key={e.name + i.toString() + i.toString()} solute={e.name} molarmass={e.molarMass} addChemicalHandler={addChemicalToSolution} editable={localEditable} />
        ))
    }
    //function callback by ChemicalList Item
    const addChemicalToSolution = (name: String) => {
        let newSelectedSolutionSolute = [...localSelectedSolution, { unit: "M", concentration: "1", solute: localChemicalList.filter(e => e.name === name)[0] }]
        setLocalSelectedSolution(newSelectedSolutionSolute, (s: Array<chemicalConc>) => {
            updateHandler(s)
        })

    }
    return (
        <div style={{ overflowY: "auto", maxHeight: '40vh' }}>
            {   //whenever chemicals are added , it is not appeared here
                renderList()
            }
        </div>
    )
}


interface RecipeListProps {
    selectedSolution: solution
    updateHandler: Function
    editable: Boolean
}

const RecipeList = ({ selectedSolution, updateHandler, editable }: RecipeListProps) => {

    //local copy
    const [localSelectedSolution, setLocalSelectedSolution] = useStateCallback(selectedSolution.soluteArray)
    const [localEditable, setLocalEditable] = useState(editable)
    //relating local state when props are changed
    useEffect(() => {
        setLocalSelectedSolution(selectedSolution.soluteArray)
        setLocalEditable(editable)
    }, [selectedSolution, editable])
    //renderring function of chemicalListItem
    const renderList = () => {
        return localSelectedSolution.map((e: chemicalConc) => (
            <RecipeListItem key={e.toString()} unit={e.unit} concentration={e.concentration} solute={e.solute} updateHandler={updateParameterFromSolution} deleteHandler={deleteChemicalFromSolution} editable={localEditable} />
        ))
    }
    //function callback by ChemicalList Item
    const deleteChemicalFromSolution = (name: String) => {
        let newSelectedSolutionSolute = localSelectedSolution.filter((e: chemicalConc) => e.solute.name !== name)
        setLocalSelectedSolution(newSelectedSolutionSolute, (s: Array<chemicalConc>) => {
            updateHandler(s)
        })
    }
    const updateParameterFromSolution = (newVal: chemicalConc) => {
        let newSelectedSolutionSolute = localSelectedSolution.map((e: chemicalConc) => {
            if (newVal.solute.name === e.solute.name) {
                return newVal
            } else {
                return e
            }
        })
        setLocalSelectedSolution(newSelectedSolutionSolute, (s: Array<chemicalConc>) => {
            updateHandler(s)
        })
    }
    return (
        <div style={{ overflowY: "auto", maxHeight: '40vh' }}>
            {renderList()}
        </div>
    )
}



interface ChemicalListItemProps {
    solute: String
    molarmass: String
    addChemicalHandler: Function
    editable: Boolean
}
const ChemicalListItem = ({ solute, molarmass, addChemicalHandler, editable }: ChemicalListItemProps) => {
    const [localEditable, setLocalEditable] = useState(editable)
    useEffect(() => {
        setLocalEditable(editable)
    }, [editable])
    return (
        <Row className="m-1">
            <Col>{solute}</Col>
            <Col>{molarmass + "g/mol"}</Col>
            <Col className="d-flex justify-content-end">
                <Button
                    onClick={() => { addChemicalHandler(solute) }}
                    disabled={!editable}
                >
                    Add
                </Button>
            </Col>
        </Row>
    )
}


interface RecipeListItemProps {
    unit: concentrationUnit
    concentration: String
    solute: chemical
    updateHandler: Function
    deleteHandler: Function
    editable: Boolean
}
const RecipeListItem = ({ unit, concentration, solute, updateHandler, deleteHandler, editable }: RecipeListItemProps) => {
    const [localEditable, setLocalEditable] = useState(editable)
    const [localConcentration, setLocalConcentration] = useState(concentration)
    const [localUnit, setLocalUnit] = useState(unit)
    useEffect(() => {
        setLocalEditable(editable)
        setLocalConcentration(concentration)
        setLocalUnit(unit)
    }, [unit, concentration, editable])
    return (
        <Row className="m-1">
            <Col>{solute.name}</Col>
            <Col>{solute.molarMass + "g/mol"}</Col>
            <Col>
                <Form.Control type="text" placeholder="" disabled={!editable} value={localConcentration.valueOf()} onChange={
                    //concentration
                    (evt) => {
                        let newComponent: chemicalConc = {
                            concentration: evt.target.value,
                            unit: localUnit,
                            solute: solute,
                        }
                        updateHandler(newComponent)
                    }
                } />
            </Col>
            <Col>
                <Form.Control as="select" value={localUnit} disabled={!editable} onChange={(evt) => {
                    let newComponent: chemicalConc = {
                        concentration: localConcentration,
                        unit: evt.target.value as concentrationUnit,
                        solute: solute,
                    }
                    updateHandler(newComponent)
                }}>
                    <option value="M" >M</option>
                    <option value="mM" >mM</option>
                    <option value="uM" >uM</option>
                    <option value="nM" >nM</option>
                    <option value="pM" >pM</option>
                </Form.Control>
            </Col>
            <Col className="d-flex justify-content-end">
                <Button
                    className="btn-danger"
                    onClick={() => deleteHandler(solute.name)}
                    disabled={!editable}
                >
                    Remove
                </Button>
            </Col>
        </Row>
    )
}
export default Solution