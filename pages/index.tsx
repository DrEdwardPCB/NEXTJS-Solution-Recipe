import React, { useEffect, useState, FC, useReducer } from 'react'
import { Row, Col, Container, Form, Collapse, Button } from 'react-bootstrap'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import useStorage from '../src/util/useStorage'
import Solution from '../src/components/Solution'
import Chemical from '../src/components/Chemical'
import Recipe from '../src/components/Recipe'

//For Navbar suggest place at the _app.tsx
interface openState {
  open: String
}
interface openAction {
  type: String
}

const SolutionRecipeMain: FC = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { getItem, setItem, removeItem } = useStorage()
  const initalOpenState: openState = { open: "RECIPE" }
  const [open, dispatchOpen] = useReducer((state: openState, action: openAction) => {
    switch (action.type) {
      case "CHEMICAL":
        return { open: "CHEMICAL" }
      case "SOLUTION":
        return { open: "SOLUTION" }
      case "RECIPE":
        return { open: "RECIPE" }
      default:
        return state
    }
  }, initalOpenState)

  return (
    <Container>
      <Row>
        <Col>
          <Row>
            <Col>
              <h3>Chemical Setup</h3>
            </Col>
            <Col className="d-flex justify-content-end">
              <Button onClick={() => {
                dispatchOpen({ type: "CHEMICAL" })
              }}>Show</Button>
            </Col>
          </Row>
          <Collapse in={open.open === "CHEMICAL"}>
            <div>
              <Chemical />
            </div>
          </Collapse>
        </Col>
      </Row>
      <hr />
      <Row>
        <Col>
          <Row>
            <Col>
              <h3>Solution Setup</h3>
            </Col>
            <Col className="d-flex justify-content-end">
              <Button onClick={() => {
                dispatchOpen({ type: "SOLUTION" })
              }}>Show</Button>
            </Col>
          </Row>
          <Collapse in={open.open === "SOLUTION"}>
            <div>
              <Solution />
            </div>
          </Collapse>
        </Col>
      </Row>
      <hr />
      <Row>
        <Col>
          <Row>
            <Col>
              <h3>Recipe</h3>
            </Col>
            <Col className="d-flex justify-content-end">
              <Button onClick={() => {
                dispatchOpen({ type: "RECIPE" })
              }}>Show</Button>
            </Col>
          </Row>
          <Collapse in={open.open === "RECIPE"}>
            <div>
              <Recipe />
            </div>
          </Collapse>
        </Col>
      </Row>
    </Container>
  )
}
export default SolutionRecipeMain

//getServerSideProps type script ver, follow the repo of CASLoginLogout to do the authentication
export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {}
  }
}
