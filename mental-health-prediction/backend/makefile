.PHONY: install setup run test demo clean

install:
	pip install -r requirements.txt

setup:
	python3 -m venv .venv
	source .venv/bin/activate && pip3 install -r requirements.txt

run:
	source .venv/bin/activate && uvicorn main:app --reload

test:
	source .venv/bin/activate && python test_emotion_api.py

demo:
	@echo "Opening emotion analysis demo in browser..."
	@echo "Make sure the backend server is running (make run)"
	open emotion_demo.html || xdg-open emotion_demo.html || start emotion_demo.html

clean:
	rm -rf .venv
