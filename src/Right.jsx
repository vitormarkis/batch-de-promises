import {
  createContext,
  useContext,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"

function PokemonPicture({ id }) {
  const { data: pokemon } = usePokemon(id)
  if (!pokemon) return "loading image"
  return (
    <img
      src={pokemon.imageUrl}
      alt={`${pokemon.name}'s picture`}
    />
  )
}

function PokemonName({ id }) {
  const { data: pokemon } = usePokemon(id)
  if (!pokemon) return "loading name"
  return <strong>{pokemon.name}</strong>
}

function usePokemon(id) {
  const pokemonRef = usePokemonRef()
  pokemonRef.current.defineQuery({
    deps: [id],
    async queryFn() {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      const pokemon = await response.json()
      return {
        imageUrl: pokemon.sprites.other.dream_world.front_default,
        name: pokemon.name,
      }
    },
  })

  return useSyncExternalStore(
    cb => pokemonRef.current.subscribe(cb),
    () => pokemonRef.current.get()
  )
}

const PokemonPromiseContext = createContext()

function PokemonPromiseProvider({ value, children }) {
  return (
    <PokemonPromiseContext.Provider value={value}>
      {children}
    </PokemonPromiseContext.Provider>
  )
}

function usePokemonRef() {
  return useContext(PokemonPromiseContext)
}

function App() {
  const [id, setId] = useState(1)
  const pokemonPromiseRef = useRef({
    state: { data: undefined },
    get() {
      return this.state
    },
    observers: new Set(),
    notify() {
      this.observers.forEach(cb => cb())
    },
    subscribe(cb) {
      this.observers.add(cb)
      return () => this.observers.delete(cb)
    },
    promise: null,
    queryFn: null,
    deps: undefined,
    async defineQuery({ deps, queryFn }) {
      const hasDeps = !!this.deps
      const sameDeps = compareDeps(deps, this.deps)
      if (hasDeps && sameDeps) return
      this.deps = deps
      this.queryFn = queryFn
      this.promise = queryFn()
      const pokemon = await this.promise
      this.state = { ...this.state, data: pokemon }
      this.notify()
    },
  })

  return (
    <PokemonPromiseProvider value={pokemonPromiseRef}>
      <button onClick={() => setId(p => p - 1)}>-</button>
      <span>{id}</span>
      <PokemonPicture id={id} />
      <PokemonName id={id} />
      <button onClick={() => setId(p => p + 1)}>+</button>
    </PokemonPromiseProvider>
  )
}

export default App

// if (deps.length !== this.deps.length)
//   throw new Error("Bad dependencies length.")

function compareDeps(deps, comparingDeps) {
  if (!comparingDeps) return undefined
  if (deps.length !== comparingDeps.length) {
    throw new Error("Bad dependencies length.")
  }
  return deps.every((dep, idx) => Object.is(dep, comparingDeps[idx]))
}

/**
 * POSTS
 */
// REF
// >> na raiz do projeto
const ref = useRef({
  queryFn: null,
  promise: null,
  async defineQuery({ queryFn }) {
    if (!!this.promise) return
    this.queryFn = queryFn
    this.promise = queryFn()
  },
})

// SINGLE-PROMISE
function usePokemon(id) {
  const pokemonRef = useContext(PokemonPromiseContext)

  pokemonRef.current.defineQuery({
    async queryFn() {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      const pokemon = await response.json()
      return {
        imageUrl: pokemon.sprites.other.dream_world.front_default,
        name: pokemon.name,
      }
    },
  })
}

// WHERE-STATE
const ref = useRef({
  queryFn: null,
  promise: null,
  state: { data: undefined },
  async defineQuery({ queryFn }) {
    if (!!this.promise) return
    this.queryFn = queryFn
    this.promise = queryFn()
    const pokemon = await this.promise
    this.state = { data: pokemon }
  },
})

// LISTEN-CHANGES
const ref = useRef({
  ...
  observers: new Set(),
  state: { data: undefined },
  subscribe(cb) {
    this.observers.add(cb)
    return () => this.observers.delete(cb)
  },
  notify() {
    this.observers.forEach(cb => cb())
  },
  get() {
    return this.state
  },
})

// SUBSCRIBE-COMPONENTS
function usePokemon(id) {
  const pokemonRef = usePokemonRef()
  pokemonRef.current.defineQuery({...})

  const refState = useSyncExternalStore(
    cb => pokemonRef.current.subscribe(cb),
    () => pokemonRef.current.get()
  )

  return {
    data: refState.data
  }
}


