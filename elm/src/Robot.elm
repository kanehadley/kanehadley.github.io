module Robot exposing (main)

import Browser

import Html exposing (Html, Attribute, div, text, button, h1, input)
import Html.Attributes exposing (style, type_)
import Html.Events exposing (on, onClick)


import Svg exposing (Svg, svg, g, rect, circle, line)
import Svg.Attributes exposing (width, height, fill, x, y, cx, cy, r, x1, y1, x2, y2, stroke, strokeWidth)

import Math.Matrix4 as Mat4 exposing (Mat4)
import Math.Vector3 as Vec3 exposing (Vec3, vec3)

import Tuple

import Json.Decode as Decode

import Debug


-- MAIN

main : Program () Model Msg
main =
  Browser.element
    { init = init
    , update = update
    , view = view
    , subscriptions = subscriptions
    }



-- MODEL


type alias Joint =
  { angle : Float
  , length : Float
  , id : Int
  , parent : Int
  }


type alias Model =
  { x : Float
  , y : Float
  , shoulder : Float
  , elbow : Float
  , wrist1 : Float
  , wrist2 : Float
  , knuckle1 : Float
  , knuckle2 : Float
  }



init : () -> (Model, Cmd Msg)
init _ =
  (
    { x = 0
    , y = 0
    , shoulder = pi/6
    , elbow = 0
    , wrist1 = pi/6
    , wrist2 = -pi/6
    , knuckle1 = -pi/6
    , knuckle2 = pi/6
    }
  , Cmd.none )




generateJoints : Float -> Float -> Float -> Float -> Float -> Float -> List Joint
generateJoints angle1 angle2 angle3 angle4 angle5 angle6 =
  [ { angle = angle1, length = 1, id = 0, parent = -1 }
  , { angle = angle2, length = 1, id = 1, parent = 0 }
  , { angle = angle3, length = 1, id = 2, parent = 1 }
  , { angle = angle4, length = 1, id = 3, parent = 1 }
  , { angle = angle5, length = 1, id = 4, parent = 2 }
  , { angle = angle6, length = 1, id = 5, parent = 3 }
  ]



type alias Part =
  ((Float, Float), (Float, Float))


jointsToParts : List Joint -> List Part
jointsToParts joints =
  List.map (\j -> inferJointTransforms joints j) joints
    |> List.map (\t -> 
        let
          ta = List.foldr (\m1 m2 -> m1 m2) Mat4.identity <| Maybe.withDefault [] <| List.tail <| Maybe.withDefault [] <| List.tail t
          tb = List.foldr (\m1 m2 -> m1 m2) Mat4.identity t
          a = Mat4.transform ta (vec3 0 0 0)
          b = Mat4.transform tb (vec3 0 0 0)
          ax = Vec3.getX a
          ay = Vec3.getY a
          bx = Vec3.getX b
          by = Vec3.getY b
        in
          ( (ax, ay)
          , (bx, by)
          )
      )



inferJointTransforms : List Joint -> Joint -> List (Mat4 -> Mat4)
inferJointTransforms joints joint =
  let
    origin = vec3 0 0 1
    base = vec3 200 200 0
    t = [Mat4.translate (vec3 (25*joint.length) 0 0), Mat4.rotate (joint.angle) origin] 
  in

    case -1 == joint.parent of
      True ->
        t ++ [Mat4.translate base]
      False ->
        t ++ (inferJointTransforms joints (getParent joints joint))



basicJoint : List Joint
basicJoint =
  [ { angle = 0, length = 1, id = 0, parent = -1 } ]


twoJoints : List Joint
twoJoints =
    [ { angle = pi/2, length = 1, id = 0, parent = -1 }
    , { angle = pi/2, length = 1, id = 1, parent = 0 }
    ]



getParent : List Joint -> Joint -> Joint
getParent joints joint =
  Maybe.withDefault { angle = 0, length = 0, id = -1, parent = -1} <| List.head <| List.filter (\j -> j.id == joint.parent) joints



-- UPDATE


type JointClass
  = Shoulder
  | Elbow
  | Wrist1
  | Wrist2
  | Knuckle1
  | Knuckle2

type Msg
  = UpdateJoint JointClass Float



update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    UpdateJoint joint radians ->
      case joint of
        Shoulder ->
          ({ model | shoulder = radians }, Cmd.none)
        Elbow ->
          ({ model | elbow = radians }, Cmd.none)
        Wrist1 ->
          ({ model | wrist1 = radians }, Cmd.none)
        Wrist2 ->
          ({ model | wrist2 = radians }, Cmd.none)
        Knuckle1 ->
          ({ model | knuckle1 = radians }, Cmd.none)
        Knuckle2 ->
          ({ model | knuckle2 = radians }, Cmd.none)



-- SUBSCRIPTIONS

subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.none


-- VIEW



onScroll : msg -> Attribute msg
onScroll message =
  on "scroll" (Decode.succeed message)


view : Model -> Html Msg
view model =
  div [ style "display" "flex" ]
    [ renderRobot model
    , div []
        [ h1 [] [ text "Controls" ]
        , div []
            [ input 
                [ type_ "range"
                , Html.Attributes.min <| String.fromFloat <| -2*pi - 0.1
                , Html.Attributes.max <| String.fromFloat <| 2*pi + 0.1
                , Html.Attributes.step "0.1"
                , Html.Attributes.value <| String.fromFloat model.shoulder
                , Html.Events.onInput (String.toFloat >> Maybe.withDefault 0 >> UpdateJoint Shoulder)
                ] []
            , text <| (++) "Shoulder " <| (++) (String.fromFloat (model.shoulder/pi)) <| " Pi Radians"
            ]
        , div [] 
            [ input 
                [ type_ "range"
                , Html.Attributes.min <| String.fromFloat <| -2*pi - 0.1
                , Html.Attributes.max <| String.fromFloat <| 2*pi + 0.1
                , Html.Attributes.step "0.1"
                , Html.Attributes.value <| String.fromFloat model.elbow
                , Html.Events.onInput (String.toFloat >> Maybe.withDefault 0 >> UpdateJoint Elbow)
                ] []
            , text <| (++) "Elbow " <| (++) (String.fromFloat (model.elbow/pi)) <| " Pi Radians"
            ]
        , div [] 
            [ input 
                [ type_ "range"
                , Html.Attributes.min <| String.fromFloat <| -2*pi - 0.1
                , Html.Attributes.max <| String.fromFloat <| 2*pi + 0.1
                , Html.Attributes.step "0.1"
                , Html.Attributes.value <| String.fromFloat model.wrist1
                , Html.Events.onInput (String.toFloat >> Maybe.withDefault 0 >> UpdateJoint Wrist1)
                ] []
            , text <| (++) "Wrist1 " <| (++) (String.fromFloat (model.wrist1/pi)) <| " Pi Radians"
            ]
        , div [] 
            [ input 
                [ type_ "range"
                , Html.Attributes.min <| String.fromFloat <| -2*pi - 0.1
                , Html.Attributes.max <| String.fromFloat <| 2*pi + 0.1
                , Html.Attributes.step "0.1"
                , Html.Attributes.value <| String.fromFloat model.wrist2
                , Html.Events.onInput (String.toFloat >> Maybe.withDefault 0 >> UpdateJoint Wrist2)
                ] []
            , text <| (++) "Wrist2 " <| (++) (String.fromFloat (model.wrist2/pi)) <| " Pi Radians"
            ]
        , div [] 
            [ input 
                [ type_ "range"
                , Html.Attributes.min <| String.fromFloat <| -2*pi - 0.1
                , Html.Attributes.max <| String.fromFloat <| 2*pi + 0.1
                , Html.Attributes.step "0.1"
                , Html.Attributes.value <| String.fromFloat model.knuckle1
                , Html.Events.onInput (String.toFloat >> Maybe.withDefault 0 >> UpdateJoint Knuckle1)
                ] []
            , text <| (++) "Knuckle1 " <| (++) (String.fromFloat (model.knuckle1/pi)) <| " Pi Radians"
            ]
        , div [] 
            [ input 
                [ type_ "range"
                , Html.Attributes.min <| String.fromFloat <| -2*pi - 0.1
                , Html.Attributes.max <| String.fromFloat <| 2*pi + 0.1
                , Html.Attributes.step "0.1"
                , Html.Attributes.value <| String.fromFloat model.knuckle2
                , Html.Events.onInput (String.toFloat >> Maybe.withDefault 0 >> UpdateJoint Knuckle2)
                ] []
            , text <| (++) "Knuckle2 " <| (++) (String.fromFloat (model.knuckle2/pi)) <| " Pi Radians"
            ]
        , div [] [ text "Instructions:" ]
        , div [] [ text "Use the sliders to modify each joint angle." ]
      ]
    ]
  


renderRobot : Model -> Svg Msg
renderRobot model =
  svg 
    [ width "400"
    , height "400"
    ]
    [ renderBorder 400 400
    , renderArm <| generateJoints model.shoulder model.elbow model.wrist1 model.wrist2 model.knuckle1 model.knuckle2   -- twoJoints
    ]


pixelX : Float -> Float
pixelX x =
  x

pixelY : Float -> Float
pixelY y =
  400 - y


renderArm : List Joint -> Svg Msg
renderArm joints =
  let
    parts = jointsToParts joints
    v = (vec3 0 0 0)
    t0 = Mat4.makeTranslate (vec3 200 200 0)
    rad = pi
    rot = Mat4.makeRotate rad (Mat4.transform t0 (vec3 0 0 1))
    t1 = Mat4.mul (Mat4.makeTranslate (vec3 50 0 0)) t0
    t2 = Mat4.mul rot t1
    w = Mat4.transform t0 v
    z = Mat4.transform t2 v


    origin = (vec3 0 0 1)
    tr0 = Mat4.identity |> Mat4.translate (vec3 200 200 0)
    tr1 = Mat4.identity 
      |> Mat4.translate (vec3 200 200 0)
      |> Mat4.rotate (pi/2) origin
      |> Mat4.translate (vec3 50 0 0) -- |> Mat4.rotate 0 (Mat4.transform tr0 (vec3 0 0 1)) |> Mat4.translate (vec3 50 0 0) 
  in
    g
      []
      <| partsToPoints parts
      
      


partsToPoints : List Part -> List (Svg Msg)
partsToPoints parts =
  List.concat
  <| List.map (\p ->
      let
        (pa, pb) = p
        (pax, pay) = pa
        (pbx, pby) = pb
      in
        [ circle
            [ cx <| String.fromFloat <| pixelX <| pax
            , cy <| String.fromFloat <| pixelY <| pay
            , r "5"
            ]
            []
        , circle
            [ cx <| String.fromFloat <| pixelX <| pbx
            , cy <| String.fromFloat <| pixelY <| pby
            , r "5"
            ]
            []
        , line
            [ x1 <| String.fromFloat <| pixelX <| pax
            , y1 <| String.fromFloat <| pixelY <| pay
            , x2 <| String.fromFloat <| pixelX <| pbx
            , y2 <| String.fromFloat <| pixelY <| pby
            , stroke "black"
            , strokeWidth "4"
            ]
            []
        ]
    ) parts


renderBorder : Float -> Float -> Svg Msg
renderBorder borderWidth borderHeight =
  g
    []
    [
      rect
        [ fill "rgb(0,0,0)"
        , width <| String.fromFloat borderWidth ++ "px"
        , height <| String.fromFloat borderHeight ++ "px"
        ]
        []
    , rect
        [ fill "rgb(255,255,255)"
        , width <| String.fromFloat (borderWidth - 10) ++ "px"
        , height <| String.fromFloat (borderHeight - 10) ++ "px"
        , x <| String.fromFloat 5
        , y <| String.fromFloat 5
        ]
        []
    ]






