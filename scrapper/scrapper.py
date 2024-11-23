import requests
from bs4 import BeautifulSoup
import time
import json
import re

def limpiar_texto(texto):
    if texto:  # Verifica que el texto no esté vacío
        # Elimina saltos de línea, tabulaciones, y caracteres especiales
        texto = re.sub(r"[\r\n\t]+", " ", texto)
        # Elimina múltiples espacios consecutivos
        texto = re.sub(r"\s{2,}", " ", texto)
        # Elimina comas iniciales o finales
        texto = texto.strip(", ")
        # Opcional: elimina contenido irrelevante específico
        texto = re.sub(r"(Enlarge image.*?Close)", "", texto, flags=re.IGNORECASE)
        texto = re.sub(r"Products & Services.*$", "", texto, flags=re.IGNORECASE)
    return texto.strip()

url = "https://www.mayoclinic.org/diseases-conditions"
response = requests.get(url)
soup = BeautifulSoup(response.content, "html.parser")

ul_tag = soup.find("ul", class_="cmp-alphabet-facet--inner")  # Puedes especificar clases si las hay: soup.find("ul", class_="nombre-clase")

li_tags = ul_tag.find_all("li", class_="cmp-alphabet-facet--letter")

datos_existentes = []

# 2. Encuentra los elementos deseados
for li in li_tags:
    a_tag = li.find("a")  # Encuentra el hipervínculo dentro del <li>
    if a_tag:  # Verifica que exista un enlace

        url2 = "https://www.mayoclinic.org" + a_tag["href"]

        cntx = 0
        response2 = requests.get(url2)
        while True:
            # time.sleep(2)    
            if response2.status_code == 200:
                break
            else:
                response2 = requests.get(url2)
            cntx+=1
            if cntx > 0:
                break
        
        if cntx > 0:
            continue
        
        # print(url2, response2)
        
        soup2 = BeautifulSoup(response2.content, "html.parser")
        data2 = soup2.find("div", class_="cmp-azresults cmp-azresults-from-model")     
        ul_tags2 = data2.find_all("ul")
        for ul_tag2 in ul_tags2:
            li_tags2 = ul_tag2.find_all("li")
            for li2 in li_tags2:
                a2_tag = li2.find("a")
                if a2_tag:
                    url3 = a2_tag["href"]
                    response3 = requests.get(url3)
                    cnt = 0
                    
                    while True:
                        # time.sleep(2)    
                        print(url3, response3)
                        if response3.status_code == 200:
                            break
                        else:
                            response3 = requests.get(url3)
                        cnt+=1
                        if cnt > 0:
                            break
                    soup3 = BeautifulSoup(response3.content, "html.parser")
                    if cnt > 0:
                        continue
                    titulo_ = ""
                    overview_ = ""
                    sintomas_ = ""
                    factores_riesgo_ = ""

                    div_main = soup3.find("div", class_="main")
                    if div_main == None:
                        print("no tiene div main")
                        continue
                    header_tag = div_main.find("header")
                    h1_tag = header_tag.find("h1")
                    print(h1_tag)
                    if h1_tag:
                        titulo_ = h1_tag.text.strip()

                    
                    content_div = soup3.find("div", class_="content")
                    secciones = []

                    if content_div:
                        h2_tags = content_div.find_all("h2")
                        for h2 in h2_tags:
                            titulo = h2.text.strip()
                            parrafos = []
                            for sibling in h2.find_next_siblings():
                                if sibling.name == "h2" or sibling.name == "h3":  # Detente si encuentras otro <h2> o <h3>
                                    break
                                
                                if titulo == "Overview":
                                    overview_ = overview_ + ", " + sibling.text.strip()
                                
                                if titulo == "Symptoms":
                                    sintomas_ = sintomas_ + ", " + sibling.text.strip()

                                if titulo == "Risk factors":
                                    factores_riesgo_ = factores_riesgo_ + ", " + sibling.text.strip()
                        

                        titulo_ = limpiar_texto(titulo_)
                        overview_ = limpiar_texto(overview_)
                        sintomas_ = limpiar_texto(sintomas_)
                        factores_riesgo_ = limpiar_texto(factores_riesgo_)
                        datos_existentes.append([{"titulo": titulo_, "overview": overview_, "sintomas": sintomas_, "risk_factors": factores_riesgo_}])

                        with open("secciones.json", "w") as file:
                            json.dump(datos_existentes, file, indent=4)
                        
                    else:
                        print("No se encontró el div con clase 'content'")
