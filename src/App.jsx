import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"

export function PokemonImage({ id }) {
  const { data: pokemon } = usePokemon(id)
  useEffect(() => console.log("PokemonImage"))
  if (!pokemon) return "loading image"
  return (
    <img
      src={pokemon.imageUrl}
      alt={pokemon.name}
    />
  )
}

export function PokemonName({ id }) {
  const { data: pokemon } = usePokemon(id)
  useEffect(() => console.log("PokemonName"))
  if (!pokemon) return "loading name"
  return <strong>{pokemon.name}</strong>
}

function usePokemon(id) {
  const pokemonRef = usePokemonRef()
  pokemonRef.current.defineQuery({
    deps: [id],
    async queryFn(signal) {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, {
        signal,
      })
      const pokemon = await response.json()
      return {
        imageUrl: pokemon.sprites.other.dream_world.front_default,
        name: pokemon.name,
      }
    },
  })

  return useSyncExternalStore(
    pokemonRef.current.subscribe.bind(pokemonRef.current),
    pokemonRef.current.get.bind(pokemonRef.current)
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
  useEffect(() => console.log("App"))
  const pokemonPromiseRef = useRef({
    state: {
      data: "",
    },
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
    controller: new AbortController(),
    async defineQuery({ deps, queryFn }) {
      const hasDeps = !!this.deps
      const sameDeps = hasDeps ? compareDeps(deps, this.deps) : undefined
      if (hasDeps && sameDeps) return
      this.deps = deps
      this.queryFn = queryFn
      this.controller.abort()
      this.controller = new AbortController()
      this.promise = queryFn(this.controller.signal)
      const pokemon = await this.promise
      this.state = { data: pokemon }
      this.notify()
    },
  })

  useEffect(() => {
    Object.assign(window, { pokemonPromiseRef })
  }, [])

  return (
    <PokemonPromiseProvider value={pokemonPromiseRef}>
      <button onClick={() => setId(p => p - 1)}>-</button>
      <span>{id}</span>
      <PokemonImage id={id} />
      <PokemonName id={id} />
      <button onClick={() => setId(p => p + 1)}>+</button>
    </PokemonPromiseProvider>
  )
}
export default App

// if (deps.length !== this.deps.length)
//   throw new Error("Bad dependencies length.")

export function compareDeps(deps, comparingDeps) {
  if (deps.length !== comparingDeps.length) {
    throw new Error("Bad dependencies length.")
  }
  return deps.every((dep, idx) => Object.is(dep, comparingDeps[idx]))
}
